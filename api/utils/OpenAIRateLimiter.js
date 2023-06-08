class OpenAIRateLimiter {
    constructor(maxRPS) {
      this.maxRPS = maxRPS;
      this.queue = [];
      this.processing = false;
  
      setInterval(() => {
        if (this.queue.length > 0 && !this.processing) {
          this.processing = true;
          const task = this.queue.shift();
          task();
        }
      }, 1000 / this.maxRPS);
    }
  
    async execute(task) {
      return new Promise((resolve, reject) => {
        this.queue.push(async () => {
          try {
            const result = await task();
            resolve(result);
          } catch (error) {
            reject(error);
          } finally {
            this.processing = false;
          }
        });
      });
    }
};

module.exports = OpenAIRateLimiter;