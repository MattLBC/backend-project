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
  test("Review object now has comment count", () => {
    return request(app)
      .get("/api/reviews/3")
      .expect(200)
      .then(({ body: { review } }) => {
        expect(review.comment_count).toBe("3");
      });
  });
  test("Can produced review object with no comments", () => {
    return request(app)
      .get("/api/reviews/11")
      .expect(200)
      .then(({ body: { review } }) => {
        expect(review.comment_count).toBe("0");
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
      .then(({ body: { users } }) => {
        expect(users).toBeInstanceOf(Array);
        expect(users.length).toBeGreaterThan(0);
        users.forEach((user) => {
          expect.objectContaining({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});

describe("GET api/reviews", () => {
  test("Status 200: returns object with correct properties, sorted in decsending date created_at", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews).toBeInstanceOf(Array);
        expect(reviews.length).toBeGreaterThan(0);
        reviews.forEach((review) => {
          expect.objectContaining({
            owner: expect.any(String),
            title: expect.any(String),
            review_id: expect.any(Number),
            category: expect.any(String),
            review_img_url: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            comment_count: expect.any(Number),
          });
        });
        expect(reviews).toBeSortedBy("created_at", {
          descending: true,
          coerce: true,
        });
      });
  });
  test("Status 200: Can sort_by other column names", () => {
    return request(app)
      .get("/api/reviews?sort_by=votes")
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews).toBeSortedBy("votes", { descending: true });
      });
  });
  test("Status 400: Can't sort_by columns that don't exist", () => {
    return request(app)
      .get("/api/reviews?sort_by=banana")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("Status 200: Can sort_by order ascending", () => {
    return request(app)
      .get("/api/reviews?sort_by=votes&order=asc")
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews).toBeSortedBy("votes", { descending: false });
      });
  });
  test("Status 400: Can't sort_by orders that don't exist", () => {
    return request(app)
      .get("/api/reviews?sort_by=votes&order=banana")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("Status 200: Can sort_by category", () => {
    const euroGames = [
      {
        review_id: 1,
        title: "Agricola",
        category: "euro game",
        designer: "Uwe Rosenberg",
        owner: "mallionaire",
        review_body: "Farmyard fun!",
        review_img_url:
          "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
        created_at: `2021-01-18T10:00:20.514Z`,
        votes: 1,
        comment_count: "0",
      },
    ];
    return request(app)
      .get("/api/reviews?category=euro game")
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews).toEqual(euroGames);
      });
  });
  test("Status 404: Can't sort_by categories that don't exist", () => {
    return request(app)
      .get("/api/reviews?category=banana")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not found");
      });
  });
  test("Status 200: Category exists but not reviews for it", () => {
    return request(app)
      .get("/api/reviews?category=children's games")
      .expect(200)
      .then(({ body }) => {
        expect(body.msg).toBe("No reviews here yet!");
      });
  });
});

describe("GET api/reviews/:review_id/comments", () => {
  test("Status 200: responds with array of comment objects", () => {
    return request(app)
      .get("/api/reviews/3/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toBeInstanceOf(Array);
        expect(comments.length).toBeGreaterThan(0);
        comments.forEach((comment) => {
          expect.objectContaining({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            review_id: expect.any(Number),
          });
        });
      });
  });
  test("Status 404: valid number but no ID", () => {
    return request(app)
      .get("/api/reviews/9999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not found");
      });
  });
  test("Status 400: Something other than a number passed as review_id ", () => {
    return request(app)
      .get("/api/reviews/banana/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("Status 200: Review exists but has no comments", () => {
    return request(app)
      .get("/api/reviews/1/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.msg).toBe("No comments here yet!");
      });
  });
});

describe("POST api/reviews/:review_id/comments", () => {
  test("Statuss 201: returns the comment", () => {
    const newComment = {
      username: "bainesface",
      body: "I have no idea what you mean, dogs are the best players because they are always loyal",
    };
    const returnedComment = {
      comment_id: 7,
      body: "I have no idea what you mean, dogs are the best players because they are always loyal",
      review_id: 3,
      author: "bainesface",
      votes: 0,
    };
    return request(app)
      .post("/api/reviews/3/comments")
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        expect(body).toEqual({
          created_at: expect.any(String),
          ...returnedComment,
        });
      });
  });
  test("Status 400: body doesn't contain body mandatory key", () => {
    const newComment = {
      username: "bainesface",
      banana:
        "I have no idea what you mean, dogs are the best players because they are always loyal",
    };
    return request(app)
      .post("/api/reviews/3/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("Status 400: body doesn't contain username mandatory key", () => {
    const newComment = {
      banana: "bainesface",
      body: "I have no idea what you mean, dogs are the best players because they are always loyal",
    };
    return request(app)
      .post("/api/reviews/3/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("Status 404: review_id doesn't exist", () => {
    const newComment = {
      username: "bainesface",
      body: "I have no idea what you mean, dogs are the best players because they are always loyal",
    };
    return request(app)
      .post("/api/reviews/9999/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Route not found");
      });
  });
  test("Status 404: User not in the database tries to post", () => {
    const newComment = {
      username: "conolly_san",
      body: "I have no idea what you mean, dogs are the best players because they are always loyal",
    };
    return request(app)
      .post("/api/reviews/3/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Route not found");
      });
  });
});

describe("DELETE api/comments/:comment_id", () => {
  test("Status 204: No body", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
      .then(({ body }) => expect(body).toEqual({}));
  });
  test("Status 404: comment_id is a number but doesn't exist", () => {
    return request(app)
      .delete("/api/comments/9999")
      .expect(404)
      .then(({ body }) => expect(body.msg).toBe("Not found"));
  });
  test("Status 400: comment_id isn\'t an number", () => {
    return request(app)
      .delete("/api/comments/banana")
      .expect(400)
      .then(({ body }) => expect(body.msg).toBe("Bad request"));
  });
});
