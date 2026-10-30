/**
 * High School Student Management System - Authentication Service
 * Khởi chạy Web Server
 */

const app = require("./app");

// Hằng số cổng cấu hình tuân theo quy chuẩn UPPER_SNAKE_CASE
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Authentication Service đang hoạt động trên cổng ${PORT}`);
});
