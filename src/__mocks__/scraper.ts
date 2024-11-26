export const Scraper = jest.fn().mockImplementation(() => ({
  login: jest.fn().mockResolvedValue(undefined),
  tweet: jest.fn().mockResolvedValue(undefined),
  quoteTweet: jest.fn().mockResolvedValue(undefined),
  getTweetPhotos: jest.fn().mockResolvedValue([]),
  retweet: jest.fn().mockResolvedValue(undefined),
  setCookies: jest.fn().mockResolvedValue(undefined),
  isLoggedIn: jest.fn().mockResolvedValue(true),
})); 