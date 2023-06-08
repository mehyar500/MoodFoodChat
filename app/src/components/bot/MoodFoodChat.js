import React, { useState, useEffect, useRef, useContext } from "react";
import { SocketContext } from "../../contexts/SocketContext";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import {
    Container,
    Paper,
    IconButton,
    TextField,
    Grid,
    Box,
    Typography,
    Chip,
} from "@mui/material";
import { Send, Mic, PhotoCamera } from "@mui/icons-material";
import { styled } from '@mui/material/styles';
import Cookies from 'js-cookie';
import { useAuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Recipe from "../common/Recipe";
import { Snackbar } from "@mui/material";
import UpgradeButton from '../common/UpgradeButton';
import { useTheme } from '@mui/material/styles';
import PreviewImage from "../common/PreviewImage";
import RecipeRec from "../common/RecipeRec";
import AdSpace from "../common/AdSpace";

const ChatContainer = styled(Paper)(({ theme }) => ({
    height: "80vh",
    overflowY: "scroll",
    padding: theme.spacing(1),
}));

const UserMessage = styled("div")(({ theme }) => ({
    background: "#e6f7ff",
    borderRadius: "15px",
    padding: "10px",
    marginBottom: "5px",
    display: "inline-block",
    maxWidth: "80%",
    color: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.text.primary,
}));

const AIMessage = styled("div")(({ theme }) => ({
    background: theme.palette.primary.main,
    borderRadius: "15px",
    padding: "10px",
    marginBottom: "5px",
    display: "inline-block",
    maxWidth: "80%",
    color: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.text.primary,
}));

const Timestamp = styled("div")(({ theme }) => ({
    fontSize: "0.7rem",
    color: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.text.secondary,
}));  

const TypingIndicator = () => {
    const [dots, setDots] = useState('.');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prevDots) => (prevDots.length < 3 ? prevDots + '.' : '.'));
        }, 500);

        return () => clearInterval(interval);
    }, []);

    return <span>{dots}</span>;
};

const ExamplePrompts = ({ onClick, theme }) => {
    const prompts = [
        "let's create food that never existed before.",
        "help me with a recipe.",
        "not sure what to eat, help me.",
        // "identify this dish for me.",
        // "help me identify ingredients in a picture?",
        "guide me while cooking.",
    ];

    return (
        <Box sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: "15px",
            padding: "10px",
            marginBottom: "5px",
            display: "inline-block",
            maxWidth: "100%",
            overflowX: "auto",
        }}>
            <Typography sx={{ fontWeight: "bold" }}>Examples:</Typography>
            {prompts.map((prompt, index) => (
                <Chip
                    key={index}
                    label={prompt}
                    onClick={() => onClick(prompt)}
                    sx={{
                        color: "#fff",
                        background: "#4fc3f7",
                        marginRight: 1,
                        marginBottom: 1,
                    }}
                />
            ))}
        </Box>
    );
};

const Message = ({ message, theme }) => {
    const { content, role, timestamp, type, recipe, imageUrl, recommendations, foodId } = message;
    const messageComponent = role === "user" ? UserMessage : AIMessage;
    switch (type) {
        case "recipe":
            return (
                <div style={{ textAlign: role === "user" ? "right" : "left" }}>
                <Recipe recipe={recipe} imageUrl={imageUrl} foodId={foodId} />
                <Typography sx={{ color: theme.palette.text.secondary }}>
                    {new Date(timestamp).toLocaleTimeString()}
                </Typography>
                </div>
            );
        case "recommendations":
            return (
                <div style={{ textAlign: role === "user" ? "right" : "left" }}>
                {recommendations.map((rec, index) => (
                    <RecipeRec key={index} recipe={rec} imageUrl={rec.imageUrl} foodId={foodId} />
                ))}
                <Typography sx={{ color: theme.palette.text.secondary }}>
                    {new Date(timestamp).toLocaleTimeString()}
                </Typography>
                </div>
            );
        default:
            return (
                <div style={{
                    textAlign: role === "user" ? "right" : "left"
                }}>
                    {React.createElement(
                        messageComponent,
                        { theme },
                        <>
                            {content}
                            {message.image && (
                                <img
                                    src={message.image}
                                    alt="User uploaded"
                                    style={{
                                        maxWidth: "60%",
                                        height: "auto",
                                        display: "block",
                                        marginBottom: "5px",
                                    }}
                                />
                            )}
                        </>,
                        <Timestamp>
                            {new Date(timestamp).toLocaleTimeString()}
                        </Timestamp>
                    )}
                </div>
            );
    }
};

const MoodFoodChat = () => {
    const { user, setUser } = useAuthContext();
    const navigate = useNavigate();
    const [openTokensDialog, setOpenTokensDialog] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const chatContainerRef = useRef();
    const { transcript } = useSpeechRecognition();
    const [showExamples] = useState(true);
    const theme = useTheme();
    const [uploadedImage, setUploadedImage] = useState(null);
    const [uploadedImagePreview, setUploadedImagePreview] = useState(null);
    const [isAIThinking, setIsAIThinking] = useState(false);
    const { socket, socketReady } = useContext(SocketContext);

    const handleExampleClick = (prompt) => {
        setInput(prompt);
    };

    useEffect(() => {
        if (!transcript) return;
        setInput(transcript);
    }, [transcript]);

    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) {
            navigate('/');
            return;
        }

        // Add check for user
        if (!user) {
            console.error('User is not logged in.');
            return;
        }
    
        if (!socket || !socketReady) {
            console.error('Socket is not connected.');
            return;
        }
        
        socket.on("message", (data) => {
            const { message, newTokens } = data;
            console.log("Message received:", message);
            setMessages((prevMessages) => [...prevMessages, message]);
    
            if (newTokens !== undefined) {
                // Update user tokens in the AuthContext
                setUser((prevUser) => ({ ...prevUser, tokens: newTokens }));
                // Update user tokens in the cookies
                const updatedUser = { ...user, tokens: newTokens };
                Cookies.set('user', JSON.stringify(updatedUser));
            }
            setIsAIThinking(false);
        });

        socket.on('disconnect', (reason) => {
            console.log(`Disconnected: ${reason}`);
        });
    
        socket.on("error", (error) => {
            console.log("Error received:", error);
            if (error.reason === 'limit') {
                setOpenTokensDialog(true);
            }
        });
    
        socket.on("connect_error", (err) => {
            console.error("Connection error:", err);
        });
    
        socket.on("reconnect_attempt", () => {
            console.log("Attempting to reconnect");
        });
    
        socket.on("reconnect_error", (err) => {
            console.error("Reconnection error:", err);
        });
    
        socket.on("reconnect_failed", () => {
            console.error("Reconnection failed");
        });
    
        return () => {
            socket.off("message");
            socket.off('disconnect');
            socket.off("error");
            socket.off("connect_error");
            socket.off("reconnect_attempt");
            socket.off("reconnect_error");
            socket.off("reconnect_failed");
        };
    }, [navigate, setUser, socket, socketReady, user, user._id]);
    

    const handleSend = async () => {
        // Check if socket exists and is connected
        if (!socket || socket.disconnected) {
          console.error('Socket is not connected.');
          return;
        }
      
        const message = {
          content: input.trim(),
          role: "user",
          timestamp: Date.now(),
        };
      
        if (uploadedImage) {
          message.image = await blobURLToBase64(uploadedImagePreview);
        }
        
        console.log('Sending message:', message);
        setMessages((prevMessages) => [...prevMessages, message]);
        socket.emit("message", message);
        setInput("");
        removeUploadedImage();
        setIsAIThinking(true);
      };      

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);    

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setUploadedImage(file);
            setUploadedImagePreview(URL.createObjectURL(file));
        }
    };

    const removeUploadedImage = () => {
        setUploadedImage(null);
        setUploadedImagePreview(null);
    };

    const blobURLToBase64 = async (blobURL) => {
        const response = await fetch(blobURL);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = reject;
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.readAsDataURL(blob);
        });
    };  

    return (
        <Container 
            maxWidth={theme.breakpoints.down('sm') ? false : 'sm'}
            sx={{
                m: 0.5,
                padding: { xs: 0, sm: '16px' },
                width: { xs: '100%', sm: 'auto', md: '40%' },
                maxHeight: '75%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Box sx={{
                padding: '16px',
                margin: '16px',
                border: '1px #e0e0e0',
                borderRadius: '10px',
                backgroundColor: theme.palette.background.paper,
                [theme.breakpoints.down('sm')]: {
                    padding: 0,
                    margin: 0,
                },
            }}>
                <ChatContainer ref={chatContainerRef}>
                    {showExamples && <ExamplePrompts onClick={handleExampleClick} theme={theme} />}
                    {messages.map((message, index) => (
                        <Message
                            key={index}
                            theme={theme}
                            message={message}
                        />
                    ))}
                    {isAIThinking && (
                        <div
                            style={{
                                textAlign: 'left',
                                marginBottom: '5px',
                            }}
                        >
                            <AIMessage>
                                <TypingIndicator />
                            </AIMessage>
                        </div>
                    )}
                </ChatContainer>
                <AdSpace /> 
                <Grid container alignItems="center" spacing={1} sx={{ marginTop: "8px" }}>
                    <Grid item xs>
                        <Box display="flex" alignItems="center">
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Type your message"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter" && input.trim()) {
                                        handleSend();
                                    }
                                }}
                                sx={{ backgroundColor: theme.palette.background.paper }}
                            />
                            {uploadedImagePreview && (
                                <Box ml={1}>
                                    <PreviewImage
                                        src={uploadedImagePreview}
                                        alt="Uploaded image"
                                        onRemove={removeUploadedImage}
                                        size={50}
                                    />
                                </Box>
                            )}
                        </Box>
                    </Grid>
                    <Grid item>
                        <IconButton
                            color="primary"
                            onClick={handleSend}
                        // disabled={!input.trim()}
                        >
                            <Send />
                        </IconButton>
                        <input
                            accept="image/*"
                            capture="environment"
                            style={{ display: "none" }}
                            id="upload-image"
                            type="file"
                            onChange={handleImageUpload}
                        />
                        <label htmlFor="upload-image">
                            <IconButton color="primary" component="span">
                                <PhotoCamera />
                            </IconButton>
                        </label>
                        <IconButton color="primary" onClick={SpeechRecognition.startListening}>
                            <Mic />
                        </IconButton>
                    </Grid>
                </Grid>
            </Box>
            <Snackbar
                open={openTokensDialog}
                autoHideDuration={6000}
                onClose={() => setOpenTokensDialog(false)}
                message="You have reached your daily token limit. Please wait for your tokens to reset or upgrade your subscription."
                action={
                    <React.Fragment>
                        <UpgradeButton onClose={() => setOpenTokensDialog(false)} />
                    </React.Fragment>
                }
            />
        </Container>
    );

};

export default MoodFoodChat;

