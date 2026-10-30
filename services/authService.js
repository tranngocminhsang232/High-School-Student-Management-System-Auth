/**
 * High School Student Management System - Authentication Service
 * Module Xác thực & Quản lý Tài khoản người dùng
 * (Bản cập nhật sau Peer Code Review: Tinh chỉnh Coding Standards, Custom Error & Edge Cases)
 */

/**
 * Lớp lỗi tùy biến (Custom Error Class) nhằm chuẩn hóa mã trạng thái HTTP
 * và mã lỗi nghiệp vụ, giải quyết vấn đề bảo trì khi chuỗi thông báo thay đổi.
 */
class AuthError extends Error {
  constructor(message, statusCode = 400, code = "AUTH_ERROR") {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * LƯU Ý VỀ KIẾN TRÚC & AN TOÀN BẢO MẬT (Theo Code Review của Nguyễn Hoàng Minh):
 * - Trong môi trường sản xuất (Production), dữ liệu sẽ được lưu trữ trong hệ quản trị CSDL (MySQL/PostgreSQL)
 *   thay vì mảng bộ nhớ tạm `users = []`.
 * - Phòng chống triệt để SQL Injection bằng cơ chế Parameterized Query (Prepared Statements):
 *   Ví dụ: await db.execute("SELECT * FROM users WHERE username = ?", [normalizedUsername]);
 * - Bảng users bắt buộc có ràng buộc duy nhất (UNIQUE) trên cột `username`.
 */
const users = [];

/**
 * Đăng ký tài khoản người dùng mới
 * @param {string} username - Tên đăng nhập
 * @param {string} password - Mật khẩu
 * @returns {Promise<Object>} Thông tin người dùng mới (không kèm passwordHash)
 */
async function register(username, password) {
  if (
    !username ||
    !password ||
    typeof username !== "string" ||
    typeof password !== "string"
  ) {
    throw new AuthError(
      "Tên đăng nhập và mật khẩu không được để trống",
      400,
      "MISSING_CREDENTIALS"
    );
  }

  // Xử lý loại bỏ khoảng trắng thừa đầu và cuối (Edge Case theo Code Review)
  const normalizedUsername = username.trim();
  if (normalizedUsername.length === 0) {
    throw new AuthError(
      "Tên đăng nhập và mật khẩu không được để trống",
      400,
      "MISSING_CREDENTIALS"
    );
  }

  if (password.length < 6) {
    throw new AuthError(
      "Mật khẩu phải có ít nhất 6 ký tự",
      400,
      "INVALID_PASSWORD_LENGTH"
    );
  }

  const existingUser = users.find(
    (user) => user.username.toLowerCase() === normalizedUsername.toLowerCase()
  );

  if (existingUser) {
    throw new AuthError(
      "Tên đăng nhập đã tồn tại",
      409,
      "DUPLICATE_USERNAME"
    );
  }

  // Giả lập mã hóa mật khẩu an toàn
  const passwordHash = `hashed_${password}`;

  const newUser = {
    id: users.length + 1,
    username: normalizedUsername,
    passwordHash,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);

  // Không bao giờ trả về passwordHash cho client
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
  if (
    !username ||
    !password ||
    typeof username !== "string" ||
    typeof password !== "string"
  ) {
    throw new AuthError(
      "Tên đăng nhập và mật khẩu không được để trống",
      400,
      "MISSING_CREDENTIALS"
    );
  }

  const normalizedUsername = username.trim();
  const expectedHash = `hashed_${password}`;

  const user = users.find(
    (u) =>
      u.username.toLowerCase() === normalizedUsername.toLowerCase() &&
      u.passwordHash === expectedHash
  );

  if (!user) {
    throw new AuthError(
      "Tên đăng nhập hoặc mật khẩu không chính xác",
      400,
      "INVALID_CREDENTIALS"
    );
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
  AuthError,
  register,
  login,
  resetUsers
};
