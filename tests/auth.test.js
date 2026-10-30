/**
 * Bộ kiểm thử tự động cho Module Xác thực (Authentication Service)
 * Sử dụng Jest + Supertest
 */

const request = require("supertest");
const app = require("../app");
const authService = require("../services/authService");

describe("Kiểm thử Module Xác thực (Authentication API)", () => {
  beforeEach(() => {
    // Đảm bảo dữ liệu người dùng được làm sạch trước mỗi ca kiểm thử
    authService.resetUsers();
  });

  describe("POST /api/auth/register", () => {
    test("1. Đăng ký thành công với thông tin hợp lệ (201 Created)", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          username: "nguyenvana",
          password: "password123"
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("message", "Đăng ký thành công");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("username", "nguyenvana");
      expect(response.body.user).not.toHaveProperty("passwordHash");
      expect(response.body.user).not.toHaveProperty("password");
    });

    test("2. Báo lỗi khi thiếu username hoặc password (400 Bad Request)", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          username: "nguyenvana"
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Tên đăng nhập và mật khẩu không được để trống"
      );
    });

    test("3. Báo lỗi khi mật khẩu ngắn hơn 6 ký tự (400 Bad Request)", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          username: "nguyenvana",
          password: "123"
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Mật khẩu phải có ít nhất 6 ký tự"
      );
    });

    test("4. Báo lỗi khi tên đăng nhập đã tồn tại (409 Conflict)", async () => {
      // Đăng ký lần 1
      await request(app)
        .post("/api/auth/register")
        .send({
          username: "nguyenvana",
          password: "password123"
        });

      // Đăng ký lần 2 trùng username
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          username: "nguyenvana",
          password: "password456"
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty(
        "message",
        "Tên đăng nhập đã tồn tại"
      );
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Chuẩn bị tài khoản mẫu cho các bài test đăng nhập
      await authService.register("nguyenvana", "password123");
    });

    test("5. Đăng nhập thành công với thông tin chính xác (200 OK)", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          username: "nguyenvana",
          password: "password123"
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Đăng nhập thành công");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("username", "nguyenvana");
      expect(response.body.user).not.toHaveProperty("passwordHash");
    });

    test("6. Báo lỗi khi mật khẩu sai (400 Bad Request)", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          username: "nguyenvana",
          password: "wrongpassword"
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Tên đăng nhập hoặc mật khẩu không chính xác"
      );
    });

    test("7. Báo lỗi khi tài khoản không tồn tại (400 Bad Request)", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          username: "nonexistentuser",
          password: "password123"
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Tên đăng nhập hoặc mật khẩu không chính xác"
      );
    });
  });
});
