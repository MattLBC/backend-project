process.env.NODE_END = "test";
const seed = require("../db/seeds/seed");
const db = require("../db/connection");
const data = require("../db/data/test-data/index");
const app = require("../app");
const request = require("supertest");

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe("Incorrect paths", () => {
  test("Status 404, responds with route not found", () => {
    return request(app)
      .get("/api/banana")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Route not found");
      });
  });
});

describe("GET api/categories", () => {
  test("Status 200 - responds with arry of categories objects, each with slug and description properties", () => {
    return request(app)
      .get("/api/categories")
      .expect(200)
      .then(({ body }) => {
        expect(body).toBeInstanceOf(Object);
        expect(body.categories).toBeInstanceOf(Array);
        body.categories.forEach((category) => {
          expect.objectContaining({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
});

describe("GET api/reviews/review_id", () => {
  test("Status 200 - responds with review object with correct properties", () => {
    return request(app)
      .get("/api/reviews/3")
      .expect(200)
      .then(({ body: { review } }) => {
        expect.objectContaining({
          review_id: expect.any(Number),
          title: expect.any(String),
          review_body: expect.any(String),
          designer: expect.any(String),
          review_img_url: expect.any(String),
          votes: expect.any(Number),
          category: expect.any(String),
          owner: expect.any(String),
          created_at: expect.any(String),
        });
      });
  });
  test("Status 404 - no review of that number", () => {
    return request(app)
      .get("/api/reviews/9999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not found");
      });
  });
  test("Status 400 - Bad request", () => {
    return request(app)
      .get("/api/reviews/banana")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});

describe("PATCH api/reviews/:review_id", () => {
  test("Status 200 - Responds with review and updated vote count", () => {
    const bodyToSend = { inc_votes: 15 };
    const updatedReview = {
      review_id: 3,
      title: "Ultimate Werewolf",
      category: "social deduction",
      designer: "Akihisa Okui",
      owner: "bainesface",
      review_body: "We couldn't find the werewolf!",
      review_img_url:
        "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
      created_at: "2021-01-18T10:01:41.251Z",
      votes: 20,
    };
    return request(app)
      .patch("/api/reviews/3")
      .send(bodyToSend)
      .expect(201)
      .then(({ body: { review } }) => {
        expect(review).toEqual(updatedReview);
      });
  });
  test("Status 404 - no review of that number", () => {
    const bodyToSend = { inc_votes: 15 };
    return request(app)
      .patch("/api/reviews/9999")
      .send(bodyToSend)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not found");
      });
  });
  test("Status 400 - not a number passed as review_id", () => {
    const bodyToSend = { inc_votes: 15 };
    return request(app)
      .patch("/api/reviews/banana")
      .send(bodyToSend)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("Status 400 - not a number passed as review_id", () => {
    const bodyToSend = { inc_votes: "banana" };
    return request(app)
      .patch("/api/reviews/3")
      .send(bodyToSend)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("Status 400 - not key of inc_votes in body of patch request", () => {
    const bodyToSend = { banana: 15 };
    return request(app)
      .patch("/api/reviews/3")
      .send(bodyToSend)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});

describe("GET api/users", () => {
  test("Status 200 - response with array of user objects, with correct properties", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: {users} }) => {
        expect(users).toBeInstanceOf(Array);
        expect(users.length).toBeGreaterThan(0)
        users.forEach((user) => {
            expect.objectContaining({
                username: expect.any(String),
                name: expect.any(String),
                avatar_url: expect.any(String)
            })
        })
      });
  });
});
