/**
 * High School Student Management System - Authentication Service
 * Cấu hình Express App và Định tuyến API Xác thực
 * (Bản cập nhật sau Peer Code Review: Xử lý ngoại lệ chuẩn hóa với mã trạng thái HTTP)
 */

const express = require("express");
const authService = require("./services/authService");

const app = express();

// Middleware giải mã JSON payload
app.use(express.json());

// API Đăng ký tài khoản
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body || {};

    const user = await authService.register(username, password);

    return res.status(201).json({
      message: "Đăng ký thành công",
      user
    });
  } catch (error) {
    // Tinh chỉnh theo Code Review: Sử dụng trực tiếp statusCode từ Custom Error thay vì so sánh chuỗi
    const status = error.statusCode || 400;

    return res.status(status).json({
      message: error.message,
      code: error.code || "REGISTRATION_ERROR"
    });
  }
});

// API Đăng nhập tài khoản
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};

    const user = await authService.login(username, password);

    return res.status(200).json({
      message: "Đăng nhập thành công",
      user
    });
  } catch (error) {
    const status = error.statusCode || 400;

    return res.status(status).json({
      message: error.message,
      code: error.code || "LOGIN_ERROR"
    });
  }
});

module.exports = app;
