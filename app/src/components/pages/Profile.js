import React from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  // Table,
  // TableBody,
  // TableCell,
  // TableContainer,
  // TableHead,
  // TableRow,
  // Paper,
  // Autocomplete,
  Stack,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { useAuthContext } from '../../contexts/AuthContext';
import Cookies from 'js-cookie';
import axios from 'axios';
import UpgradeButton from '../common/UpgradeButton';
import CancelSubscriptionButton from '../common/CancelSubscriptionButton';

const Profile = () => {
  const { user } = useAuthContext();
  // const [menuItems, setMenuItems] = useState(user.preference?.userMenu || []);
  // const [newMenuItem, setNewMenuItem] = useState({ type: '', name: '', cuisine: '' });
  // const [cuisines, setCuisines] = useState([]);

  // useEffect(() => {
  //   const fetchCuisines = async () => {
  //     try {
  //       const response = await axios.get(`${process.env.REACT_APP_API_URL}/cuisines`);
  //       setCuisines(response.data);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };
  
  //   fetchCuisines();
  // }, []);
  
  // const handleAddMenuItem = () => {
  //   setMenuItems((prevItems) => [...prevItems, newMenuItem]);
  //   setNewMenuItem({ type: '', name: '', cuisine: '' });
  // };  

  const savePreferences = async () => {
    const token = Cookies.get('token');
    if (!token) {
      // Redirect to login or display an error message to the user
      return;
    }
  
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/user/${user._id}/preference`,
        // { userMenu: menuItems },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error(error);
    }
  };

  // useEffect(() => {
  //   const fetchUserPreference = async () => {
  //     const token = Cookies.get('token');
  //     if (!token) {
  //       // Redirect to login or display an error message to the user
  //       return;
  //     }

  //     try {
  //       const response = await axios.get(
  //         `${process.env.REACT_APP_API_URL}/user/me`,
  //         { headers: { Authorization: `Bearer ${token}` } }
  //       );

  //       // setMenuItems(response.data.preference?.userMenu || []);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  //   fetchUserPreference();
  // }, [user._id]);

  // const handleRemoveMenuItem = async (itemToRemove) => {
  //   // Remove the item from the local state
  //   const updatedMenuItems = menuItems.filter((item) => item !== itemToRemove);
  //   setMenuItems(updatedMenuItems);
  
  //   // Call the API to delete the item in the backend
  //   const token = Cookies.get('token');
  //   if (!token) {
  //     // Redirect to login or display an error message to the user
  //     return;
  //   }
  
  //   try {
  //     await axios.post(
  //       `${process.env.REACT_APP_API_URL}/user/${user._id}/preference`,
  //       { itemToRemove },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };   
  
  return (
    <Container>
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h4" align="center">
          My Preferences
        </Typography>
      </Box>
  
      <Stack spacing={4}>
        <Card>
          <CardContent>
            <Typography variant="h6">Profile Information</Typography>
            <Divider />
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Name"
                value={user.displayName}
                InputProps={{ readOnly: true }}
                variant="filled"
              />
              <TextField
                fullWidth
                label="Email"
                value={user.email}
                InputProps={{ readOnly: true }}
                variant="filled"
                sx={{ mt: 2 }}
              />
            </Box>
          </CardContent>
        </Card>
  
        <Card>
          <CardContent>
            <Typography variant="h6">Subscription</Typography>
            <Divider />
            <Box sx={{ mt: 2 }}>
            <Typography>
                Subscription Type:{' '}
                <Box
                  component="span"
                  sx={{
                    fontWeight: 'bold',
                    backgroundColor:
                      user.subscriptionType === 'free' ? 'yellow' : 'skyblue',
                    padding: 1,
                    borderRadius: 1,
                  }}
                >
                  {user.subscriptionType}
                </Box>
              </Typography>
              {user.subscriptionType === 'free' ? (
                <Box sx={{ mt: 1 }}>
                  <Typography>
                    Upgrade to Premium for more daily tokens, faster
                    response times, and more!
                  </Typography>
                  <UpgradeButton />
                </Box>
              ): (
                <Box sx={{ mt: 1 }}>
                  <Typography>
                    Cancel your subscription to downgrade to the free plan.
                  </Typography>
                  <CancelSubscriptionButton />
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
{/*   
        <Card>
          <CardContent>
            <Typography variant="h6">My Menu</Typography>
            <Divider />
            <Box sx={{ mt: 2 }}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Food Type</TableCell>
                      <TableCell>Food Name</TableCell>
                      <TableCell>Cuisine</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                  {menuItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.cuisine}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleRemoveMenuItem(item)}
                        >
                          X
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box
                sx={{
                  mt: 2,
                  mb: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <TextField
                  label="Food Type"
                  value={newMenuItem.type}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, type: e.target.value })}
                />
                <TextField
                  label="Food Name"
                  value={newMenuItem.name}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                />
                <Autocomplete
                  options={cuisines.map((cuisine) => cuisine.name)}
                  value={cuisines.map((cuisine) => cuisine.name).includes(newMenuItem.cuisine) ? newMenuItem.cuisine : null}
                  onChange={(event, newValue) => {
                    setNewMenuItem({ ...newMenuItem, cuisine: newValue });
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Cuisine" />
                  )}
                  sx={{ mb: 2, width: 150 }}
                />
                <Button variant="contained" color="primary" onClick={handleAddMenuItem}>
                  Add Menu Item
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card> */}

      </Stack>
  
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button variant="contained" color="secondary" onClick={savePreferences}>
          Save Preferences
        </Button>
      </Box>
    </Container>
  );
};

export default Profile;