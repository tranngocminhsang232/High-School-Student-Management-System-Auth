/**
 * High School Student Management System - Authentication Service
 * Module Xác thực & Quản lý Tài khoản người dùng
 */

// Lưu trữ dữ liệu tài khoản tạm thời trong bộ nhớ
const users = [];

/**
 * Đăng ký tài khoản người dùng mới
 * @param {string} username - Tên đăng nhập
 * @param {string} password - Mật khẩu
 * @returns {Promise<Object>} Thông tin người dùng mới (không kèm mật khẩu)
 */
async function register(username, password) {
  if (!username || !password) {
    throw new Error("Tên đăng nhập và mật khẩu không được để trống");
  }

  if (typeof password !== "string" || password.length < 6) {
    throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
  }

  const existingUser = users.find((user) => user.username === username);
  if (existingUser) {
    throw new Error("Tên đăng nhập đã tồn tại");
  }

  // Giả lập hash mật khẩu (Best practice: không lưu plain-text)
  const passwordHash = `hashed_${password}`;

  const newUser = {
    id: users.length + 1,
    username,
    passwordHash,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);

  // An toàn bảo mật: Loại bỏ passwordHash trước khi trả về client
  const { passwordHash: _removed, ...safeUser } = newUser;
  return safeUser;
}

/**
 * Đăng nhập hệ thống
 * @param {string} username - Tên đăng nhập
 * @param {string} password - Mật khẩu
 * @returns {Promise<Object>} Thông tin người dùng khi đăng nhập thành công
 */
async function login(username, password) {
  if (!username || !password) {
    throw new Error("Tên đăng nhập và mật khẩu không được để trống");
  }

  const expectedHash = `hashed_${password}`;
  const user = users.find(
    (u) => u.username === username && u.passwordHash === expectedHash
  );

  if (!user) {
    throw new Error("Tên đăng nhập hoặc mật khẩu không chính xác");
  }

  const { passwordHash: _removed, ...safeUser } = user;
  return safeUser;
}

/**
 * Xóa danh sách người dùng (Phục vụ reset state giữa các test case)
 */
function resetUsers() {
  users.length = 0;
}

module.exports = {
  register,
  login,
  resetUsers
};
