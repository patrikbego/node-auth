const utils = require('../utils');

const items = [
  {
    "id": 1,
    "title": "Free",
    "price": 0,
    "description": ["10 users included", "2 GB of storage", "Help center access", "Email support"],
    "buttonText": "Sign up for free",
    "buttonVariant": "outlined"
  },
  {
    "id": 2,
    "title": "Pro",
    "subheader": "Most popular",
    "price": 15,
    "description": [
      "20 users included",
      "10 GB of storage",
      "Help center access",
      "Priority email support"
    ],
    "buttonText": "Get started",
    "buttonVariant": "contained"
  },
  {
    "id": 3,
    "title": "Enterprise",
    "price": 30,
    "description": [
      "50 users included",
      "30 GB of storage",
      "Help center access",
      "Phone & email support"
    ],
    "buttonText": "Contact us",
    "buttonVariant": "outlined"
  }
]

const itemsService = {
  async getItems() {
    return utils.responseObject(200, null, JSON.parse(JSON.stringify(items)));
  },
};

module.exports = itemsService;
