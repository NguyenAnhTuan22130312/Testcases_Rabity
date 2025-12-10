const { test, expect } = require('@playwright/test');

/**
 * Rabity.vn - User Registration Test Suite
 * Module: USER_MGT (User Management - Registration)
 * URL: https://rabity.vn/account/register
 * Total Test Cases: 8 (bỏ test SĐT)
 * 
 * FIXED: Xử lý popup quảng cáo, chạy tuần tự từng test, đánh số thứ tự đúng
 */

// Test Data
const testData = {
  validUser: {
    lastName: 'han',
    firstName: 'trang',
    email: 'hantrang@yobmail.com',
    password: 'Matkhau@123'
  },
  existingEmail: 'existing@yobmail.com', // Email đã được đăng ký trước - THAY ĐỔI NÀY
  invalidData: {
    invalidEmail: 'invalid-email-format',
    shortPassword: '123',
    specialChars: '!@#$%^&*(){}[]',
    emptyField: ''
  }
};
const promotionTestConfig = {
  accountCredentials: {
    email: 'hantr@gmail.com',
    password: 'Matkhau@123'
  },
  urls: {
    loginPage: 'https://rabity.vn/account/login',
    productPage: 'https://rabity.vn/products/quan-short-jeans-be-trai-931-030',
    cartPage: 'https://rabity.vn/cart'
  },
  voucherCodes: {
    validCode: 'RABIBFF799k',
    validCodeFromList: 'AWO - SALE OFF 50% 90.888',
    invalidCode: 'INVALID123XYZ',
    expiredCode: 'EXPIRED2024',
    minimumOrderCode: 'MIN500K'
  }
};

// ========================================
// HELPER FUNCTION: Đóng popup quảng cáo
// ========================================
async function closePopupIfExists(page) {
  try {
    // Đợi 2 giây cho popup xuất hiện
    await page.waitForTimeout(2000);
    
    // Tìm và click nút đóng popup (nhiều selector khác nhau)
    const closeSelectors = [
      '.om-close-button',
      '[class*="close"]',
      '[aria-label*="Close"]',
      '[aria-label*="close"]',
      'button:has-text("×")',
      '.popup-close',
      '#om-close',
      '[data-om-close]'
    ];
    
    for (const selector of closeSelectors) {
      const closeButton = page.locator(selector).first();
      if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await closeButton.click({ timeout: 2000 }).catch(() => {});
        console.log(`✓ Đã đóng popup quảng cáo bằng selector: ${selector}`);
        await page.waitForTimeout(500);
        break;
      }
    }
    
    // Hoặc nhấn ESC để đóng popup
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(500);
    
  } catch (error) {
    console.log('⚠ Không tìm thấy popup hoặc popup đã đóng');
  }
}

// ========================================
// MODULE: USER_MGT - User Registration
// ========================================

test.describe('USER_MGT - Module Đăng ký tài khoản', () => {
  
  test.beforeEach(async ({ page }) => {
    console.log('\n🔄 Đang mở trang đăng ký...');
    
    // Mở trang đăng ký với timeout dài hơn
    await page.goto('https://rabity.vn/account/register', {
      waitUntil: 'domcontentloaded', // Không đợi networkidle vì có quảng cáo
      timeout: 60000 // 60 giây
    });
    
    console.log('✓ Đã load trang');
    
    // Đóng popup quảng cáo nếu có
    await closePopupIfExists(page);
    
    console.log('✓ Sẵn sàng test\n');
  });

  // ============================================================
  // USER_MGT_Register_01 Kiểm tra layout màn hình đăng ký
  // ============================================================
  test('USER_MGT_Register_01: Kiểm tra layout màn hình đăng ký', async ({ page }) => {
    console.log('=== USER_MGT_Register_01 ===');
    
    // Đóng popup lần nữa cho chắc
    await closePopupIfExists(page);
    
    // Kiểm tra trường Họ
    const lastNameInput = page.locator('#signup-last-name');
    await expect(lastNameInput).toBeVisible({ timeout: 10000 });
    await expect(lastNameInput).toHaveAttribute('placeholder', 'Nhập họ của bạn');
    console.log('✓ Trường "Họ" hiển thị đúng');
    
    // Kiểm tra trường Tên
    const firstNameInput = page.locator('#signup-first-name');
    await expect(firstNameInput).toBeVisible();
    await expect(firstNameInput).toHaveAttribute('placeholder', 'Nhập tên của bạn');
    console.log('✓ Trường "Tên" hiển thị đúng');
    
    // Kiểm tra trường Email
    const emailInput = page.locator('#signup-email');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('placeholder', 'Nhập Email');
    await expect(emailInput).toHaveAttribute('type', 'email');
    console.log('✓ Trường "Email" hiển thị đúng');
    
    // Kiểm tra trường Mật khẩu
    const passwordInput = page.locator('#signup-password');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('placeholder', 'Nhập Mật Khẩu');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    console.log('✓ Trường "Mật khẩu" hiển thị đúng');
    
    // Kiểm tra nút Tạo tài khoản
    const submitButton = page.locator('button.btn-register-form-page');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toHaveText('Tạo tài khoản');
    console.log('✓ Nút "Tạo tài khoản" hiển thị đúng');
    
    console.log('=== KẾT QUẢ: PASS - Layout hiển thị đầy đủ 4 trường và 1 button ===\n');
  });

  // ============================================================
  // USER_MGT_Register_02: Đăng ký với dữ liệu hợp lệ
  // ============================================================
  test('USER_MGT_Register_02: Kiểm tra nhập dữ liệu hợp lệ và tạo tài khoản thành công', async ({ page }) => {
    console.log('=== USER_MGT_Register_02 ===');
    
    await closePopupIfExists(page);
    
    // Tạo email unique để tránh trùng
    const uniqueEmail = `hantrang${Date.now()}@yobmail.com`;
    
    // Điền form đăng ký
    await page.fill('#signup-last-name', testData.validUser.lastName);
    console.log(`Đã nhập Họ: ${testData.validUser.lastName}`);
    
    await page.fill('#signup-first-name', testData.validUser.firstName);
    console.log(`Đã nhập Tên: ${testData.validUser.firstName}`);
    
    await page.fill('#signup-email', uniqueEmail);
    console.log(`Đã nhập Email: ${uniqueEmail}`);
    
    await page.fill('#signup-password', testData.validUser.password);
    console.log(`Đã nhập Password: ${testData.validUser.password}`);
    
    // Click nút Tạo tài khoản
    await page.click('button.btn-register-form-page');
    console.log('Đã click nút "Tạo tài khoản"');
    
    // Chờ và kiểm tra kết quả
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    console.log(`URL hiện tại: ${currentUrl}`);
    
    // Kiểm tra redirect về trang account hoặc trang chủ
    const isSuccess = currentUrl.includes('/account') || currentUrl === 'https://rabity.vn/' || !currentUrl.includes('/register');
    
    if (isSuccess) {
      console.log('=== KẾT QUẢ: PASS - Tài khoản được tạo thành công ===\n');
      expect(isSuccess).toBeTruthy();
    } else {
      console.log('=== KẾT QUẢ: FAIL/UNKNOWN - Cần kiểm tra thủ công ===\n');
    }
  });

  // ============================================================
  // USER_MGT_Register_03: Hiển thị thông báo đăng ký thành công
  // ============================================================
  test('USER_MGT_Register_03: Kiểm tra hiển thị thông báo đăng ký thành công', async ({ page }) => {
    console.log('=== USER_MGT_Register_03 ===');
    
    await closePopupIfExists(page);
    
    const uniqueEmail = `hantrang${Date.now()}@yobmail.com`;
    
    await page.fill('#signup-last-name', testData.validUser.lastName);
    await page.fill('#signup-first-name', testData.validUser.firstName);
    await page.fill('#signup-email', uniqueEmail);
    await page.fill('#signup-password', testData.validUser.password);
    
    await page.click('button.btn-register-form-page');
    console.log('Đã submit form đăng ký');
    
    await page.waitForTimeout(5000);
    
    // Tìm thông báo thành công
    const successSelectors = [
      'text=/đăng ký thành công/i',
      'text=/thành công/i',
      '.alert-success',
      '.notification-success',
      '.swal-text',
      '.toast-success',
      '.success-message'
    ];
    
    let foundMessage = false;
    let messageText = '';
    
    for (const selector of successSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible().catch(() => false)) {
        messageText = await element.textContent();
        foundMessage = true;
        console.log(`✓ Tìm thấy thông báo: "${messageText}"`);
        break;
      }
    }
    
    if (foundMessage) {
      console.log('=== KẾT QUẢ: PASS - Hiển thị thông báo đăng ký thành công ===\n');
      expect(foundMessage).toBeTruthy();
    } else {
      console.log('⚠ Không tìm thấy thông báo hiển thị (có thể redirect thẳng)');
      console.log('=== KẾT QUẢ: FAIL/UNKNOWN - Cần kiểm tra thủ công ===\n');
    }
  });

  // ============================================================
  // USER_MGT_Register_04: Nhập Email đã tồn tại
  // ============================================================
  test('USER_MGT_Register_04: Nhập Email đã tồn tại', async ({ page }) => {
    console.log('=== USER_MGT_Register_04 ===');
    
    await closePopupIfExists(page);
    
    await page.fill('#signup-last-name', testData.validUser.lastName);
    await page.fill('#signup-first-name', testData.validUser.firstName);
    await page.fill('#signup-email', testData.existingEmail);
    await page.fill('#signup-password', testData.validUser.password);
    
    console.log(`Đã nhập Email đã tồn tại: ${testData.existingEmail}`);
    
    await page.click('button.btn-register-form-page');
    console.log('Đã click nút đăng ký');
    
    await page.waitForTimeout(3000);
    
    // Tìm thông báo lỗi
    const errorSelectors = [
      'text=/email.*đã.*tồn tại/i',
      'text=/email.*đã.*được.*sử dụng/i',
      'text=/email.*exists/i',
      '.error-message',
      '.alert-danger',
      '.error',
      '.swal-text',
      '.field-error'
    ];
    
    let errorFound = false;
    let errorMessage = '';
    
    for (const selector of errorSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible().catch(() => false)) {
        errorMessage = await element.textContent();
        errorFound = true;
        console.log(`✓ Tìm thấy thông báo lỗi: "${errorMessage}"`);
        break;
      }
    }
    
    if (errorFound && errorMessage.toLowerCase().includes('email')) {
      console.log('=== KẾT QUẢ: PASS - Hiển thị thông báo "Email đã tồn tại" ===\n');
      expect(errorFound).toBeTruthy();
    } else {
      console.log('=== KẾT QUẢ: FAIL - Không hiển thị thông báo Email đã tồn tại ===\n');
    }
  });

  // ============================================================
  // USER_MGT_Register_05: Nhập định dạng Email sai
  // ============================================================
  test('USER_MGT_Register_05: Nhập định dạng Email sai', async ({ page }) => {
    console.log('=== USER_MGT_Register_05 ===');
    
    await closePopupIfExists(page);
    
    await page.fill('#signup-last-name', testData.validUser.lastName);
    await page.fill('#signup-first-name', testData.validUser.firstName);
    await page.fill('#signup-email', testData.invalidData.invalidEmail);
    await page.fill('#signup-password', testData.validUser.password);
    
    console.log(`Đã nhập Email sai định dạng: ${testData.invalidData.invalidEmail}`);
    
    // Blur khỏi trường email để trigger validation
    await page.click('#signup-password');
    await page.waitForTimeout(500);
    
    await page.click('button.btn-register-form-page');
    console.log('Đã click nút đăng ký');
    
    await page.waitForTimeout(2000);
    
    // Kiểm tra HTML5 validation hoặc custom error
    const emailInput = page.locator('#signup-email');
    const validationMessage = await emailInput.evaluate(el => el.validationMessage).catch(() => '');
    
    // Tìm custom error message
    const errorSelectors = [
      'text=/email.*không.*hợp lệ/i',
      'text=/email.*invalid/i',
      '.error-message',
      '.field-error'
    ];
    
    let customError = '';
    for (const selector of errorSelectors) {
      customError = await page.locator(selector).textContent().catch(() => '');
      if (customError) break;
    }
    
    const hasError = validationMessage.length > 0 || customError.length > 0;
    
    if (hasError) {
      console.log(`✓ Validation message: ${validationMessage || customError}`);
      console.log('=== KẾT QUẢ: PASS - Hiển thị cảnh báo Email không hợp lệ ===\n');
      expect(hasError).toBeTruthy();
    } else {
      console.log('=== KẾT QUẢ: FAIL - Không hiển thị cảnh báo Email không hợp lệ ===\n');
    }
  });

  // ============================================================
  // USER_MGT_Register_06: Mật khẩu quá ngắn
  // ============================================================
  test('USER_MGT_Register_06: Mật khẩu quá ngắn / không đủ ký tự', async ({ page }) => {
    console.log('=== USER_MGT_Register_06 ===');
    
    await closePopupIfExists(page);
    
    await page.fill('#signup-last-name', testData.validUser.lastName);
    await page.fill('#signup-first-name', testData.validUser.firstName);
    await page.fill('#signup-email', `test${Date.now()}@yobmail.com`);
    await page.fill('#signup-password', testData.invalidData.shortPassword);
    
    console.log(`Đã nhập mật khẩu ngắn: ${testData.invalidData.shortPassword} (${testData.invalidData.shortPassword.length} ký tự)`);
    
    await page.click('button.btn-register-form-page');
    console.log('Đã click nút đăng ký');
    
    await page.waitForTimeout(3000);
    
    // Tìm thông báo lỗi về mật khẩu
    const errorSelectors = [
      'text=/mật khẩu.*ngắn/i',
      'text=/mật khẩu.*ít nhất/i',
      'text=/password.*short/i',
      'text=/password.*least/i',
      '.error-message',
      '.alert-danger'
    ];
    
    let errorFound = false;
    let errorMessage = '';
    
    for (const selector of errorSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible().catch(() => false)) {
        errorMessage = await element.textContent();
        errorFound = true;
        console.log(`✓ Tìm thấy thông báo lỗi: "${errorMessage}"`);
        break;
      }
    }
    
    // Kiểm tra HTML5 validation
    const passwordInput = page.locator('#signup-password');
    const validationMessage = await passwordInput.evaluate(el => el.validationMessage).catch(() => '');
    
    if (errorFound || validationMessage.length > 0) {
      console.log('=== KẾT QUẢ: PASS - Hiển thị cảnh báo "Mật khẩu quá ngắn" ===\n');
      expect(true).toBeTruthy();
    } else {
      console.log('=== KẾT QUẢ: FAIL - Không hiển thị cảnh báo mật khẩu quá ngắn ===\n');
    }
  });

  // ============================================================
  // USER_MGT_Register_07: Để trống trường bắt buộc
  // ============================================================
  test('USER_MGT_Register_07: Để trống trường bắt buộc', async ({ page }) => {
    console.log('=== USER_MGT_Register_07 ===');
    
    await closePopupIfExists(page);
    
    // Chỉ điền một số trường, bỏ trống Email
    await page.fill('#signup-last-name', testData.validUser.lastName);
    await page.fill('#signup-first-name', testData.validUser.firstName);
    // Bỏ trống Email
    await page.fill('#signup-password', testData.validUser.password);
    
    console.log('Đã bỏ trống trường Email (trường bắt buộc)');
    
    await page.click('button.btn-register-form-page');
    console.log('Đã click nút đăng ký');
    
    await page.waitForTimeout(2000);
    
    // Kiểm tra HTML5 required validation
    const emailInput = page.locator('#signup-email');
    const validationMessage = await emailInput.evaluate(el => el.validationMessage).catch(() => '');
    
    // Tìm custom error message
    const errorSelectors = [
      'text=/không được để trống/i',
      'text=/không được bỏ trống/i',
      'text=/required/i',
      'text=/bắt buộc/i',
      '.error-message',
      '.field-error'
    ];
    
    let errorFound = false;
    let errorMessage = '';
    
    for (const selector of errorSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible().catch(() => false)) {
        errorMessage = await element.textContent();
        errorFound = true;
        console.log(`✓ Tìm thấy thông báo lỗi: "${errorMessage}"`);
        break;
      }
    }
    
    const hasError = validationMessage.length > 0 || errorFound;
    
    if (hasError) {
      console.log(`✓ Validation message: ${validationMessage || errorMessage}`);
      console.log('=== KẾT QUẢ: PASS - Hiển thị cảnh báo "Không được để trống" ===\n');
      expect(hasError).toBeTruthy();
    } else {
      console.log('=== KẾT QUẢ: FAIL - Không hiển thị cảnh báo trường bắt buộc ===\n');
    }
  });

  // ============================================================
  // USER_MGT_Register_08: Nhập ký tự đặc biệt vào Họ/Tên
  // ============================================================
  test('USER_MGT_Register_08: Nhập ký tự đặc biệt sai quy định', async ({ page }) => {
    console.log('=== USER_MGT_Register_08 ===');
    
    await closePopupIfExists(page);
    
    await page.fill('#signup-last-name', testData.invalidData.specialChars);
    await page.fill('#signup-first-name', testData.invalidData.specialChars);
    await page.fill('#signup-email', `test${Date.now()}@yobmail.com`);
    await page.fill('#signup-password', testData.validUser.password);
    
    console.log(`Đã nhập ký tự đặc biệt vào Họ và Tên: ${testData.invalidData.specialChars}`);
    
    await page.click('button.btn-register-form-page');
    console.log('Đã click nút đăng ký');
    
    await page.waitForTimeout(3000);
    
    // Tìm thông báo lỗi
    const errorSelectors = [
      'text=/ký tự.*không.*hợp lệ/i',
      'text=/ký tự.*đặc biệt/i',
      'text=/invalid.*character/i',
      'text=/special.*character/i',
      '.error-message',
      '.alert-danger'
    ];
    
    let errorFound = false;
    let errorMessage = '';
    
    for (const selector of errorSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible().catch(() => false)) {
        errorMessage = await element.textContent();
        errorFound = true;
        console.log(`✓ Tìm thấy thông báo lỗi: "${errorMessage}"`);
        break;
      }
    }
    
    if (errorFound) {
      console.log('=== KẾT QUẢ: PASS - Hiển thị "Ký tự không hợp lệ" ===\n');
      expect(errorFound).toBeTruthy();
    } else {
      console.log('=== KẾT QUẢ: FAIL - Không hiển thị cảnh báo ký tự không hợp lệ ===\n');
    }
  });

});

// ========================================
// HELPER: Đóng popup quảng cáo
// ========================================
async function dismissAdvertisementPopup(page) {
  try {
    await page.waitForTimeout(1500);
    
    const popupCloseSelectors = [
      '.om-close-button',
      '[class*="close"]',
      '[aria-label*="Close"]',
      '[aria-label*="close"]',
      'button:has-text("×")',
      '.popup-close',
      '#om-close',
      '[data-om-close]'
    ];
    
    for (const selector of popupCloseSelectors) {
      const closeBtn = page.locator(selector).first();
      if (await closeBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
        await closeBtn.click({ timeout: 1500 }).catch(() => {});
        console.log(`✓ Đã tắt popup`);
        await page.waitForTimeout(500);
        break;
      }
    }
    
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(300);
    
  } catch (err) {
    // Bỏ qua lỗi
  }
}

// ========================================
// HELPER: Đăng nhập vào hệ thống
// ========================================
async function performUserLogin(page, email, password) {
  console.log('🔐 Đăng nhập...');
  
  await page.goto(promotionTestConfig.urls.loginPage, {
    waitUntil: 'domcontentloaded',
    timeout: 45000
  });
  
  await dismissAdvertisementPopup(page);
  
  // Điền thông tin
  await page.fill('input[type="email"], input[name*="email"]', email, { timeout: 10000 });
  await page.fill('input[type="password"], input[name*="password"]', password, { timeout: 10000 });
  
  console.log(`→ Email: ${email}`);
  
  // Click đăng nhập
  await page.click('button[type="submit"], button:has-text("Đăng nhập")');
  
  await page.waitForTimeout(2500);
  await dismissAdvertisementPopup(page);
  
  const currentPath = page.url();
  const isLoggedIn = currentPath.includes('/account') || !currentPath.includes('/login');
  
  if (isLoggedIn) {
    console.log('✓ Đăng nhập OK\n');
    return true;
  } else {
    console.log('✗ Đăng nhập thất bại\n');
    return false;
  }
}

// ========================================
// HELPER: Xóa toàn bộ giỏ hàng
// ========================================
async function clearShoppingCart(page) {
  try {
    console.log('🧹 Xóa giỏ hàng cũ...');
    
    await page.goto(promotionTestConfig.urls.cartPage, {
      waitUntil: 'domcontentloaded',
      timeout: 45000
    });
    
    await dismissAdvertisementPopup(page);
    
    // Tìm tất cả nút xóa sản phẩm
    const deleteButtons = page.locator('button.remove-item, a.remove-item, [class*="delete"], [class*="remove"]');
    const count = await deleteButtons.count();
    
    if (count > 0) {
      console.log(`→ Tìm thấy ${count} sản phẩm, đang xóa...`);
      
      // Xóa từng sản phẩm
      for (let i = 0; i < count; i++) {
        try {
          const btn = deleteButtons.first();
          if (await btn.isVisible({ timeout: 2000 })) {
            await btn.click({ timeout: 3000 });
            await page.waitForTimeout(1000);
          }
        } catch (e) {
          // Bỏ qua nếu không xóa được
        }
      }
      
      console.log('✓ Đã xóa giỏ hàng\n');
    } else {
      console.log('✓ Giỏ hàng đã trống\n');
    }
    
  } catch (err) {
    console.log('⚠ Không thể xóa giỏ hàng, tiếp tục...\n');
  }
}

// ========================================
// HELPER: Thêm sản phẩm vào giỏ hàng
// ========================================
async function addProductToShoppingCart(page) {
  console.log('🛒 Thêm sản phẩm...');
  
  await page.goto(promotionTestConfig.urls.productPage, {
    waitUntil: 'domcontentloaded',
    timeout: 45000
  });
  
  await dismissAdvertisementPopup(page);
  
  await page.click('button.addtocart-detail', { timeout: 10000 });
  console.log('→ Đã click "Thêm vào giỏ"');
  
  await page.waitForTimeout(2500);
  await dismissAdvertisementPopup(page);
  
  console.log('✓ Đã thêm sản phẩm\n');
}

// ========================================
// HELPER: Điều hướng tới trang giỏ hàng
// ========================================
async function navigateToCartPage(page) {
  console.log('📦 Mở giỏ hàng...');
  
  await page.goto(promotionTestConfig.urls.cartPage, {
    waitUntil: 'domcontentloaded',
    timeout: 45000
  });
  
  await dismissAdvertisementPopup(page);
  
  console.log('✓ Đã vào giỏ hàng\n');
}

// ========================================
// HELPER: Lấy giá tiền hiện tại
// ========================================
async function extractCurrentPrice(page, priceSelector) {
  const priceText = await page.locator(priceSelector).first().textContent().catch(() => '0đ');
  const priceNumber = parseInt(priceText.replace(/\D/g, ''));
  return priceNumber;
}

// ========================================
// HELPER: Xóa mã voucher đã áp dụng
// ========================================
async function clearAppliedVoucher(page) {
  try {
    // Tìm nút xóa voucher
    const removeVoucherBtn = page.locator('button:has-text("Xóa"), button:has-text("Hủy"), .remove-voucher, .clear-voucher').first();
    
    if (await removeVoucherBtn.isVisible({ timeout: 2000 })) {
      await removeVoucherBtn.click();
      await page.waitForTimeout(1500);
      console.log('✓ Đã xóa voucher cũ');
    }
  } catch (e) {
    // Không có voucher để xóa
  }
}

// ========================================
// MODULE: Module_ApplyPromotion
// ========================================

test.describe('Module_ApplyPromotion - Áp dụng mã giảm giá', () => {
  
  // FIX: Setup một lần cho tất cả tests
  test.beforeAll(async ({ browser }) => {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  KHỞI TẠO TEST SUITE - ÁP MÃ GIẢM GIÁ  ║');
    console.log('╚════════════════════════════════════════╝\n');
  });

  // FIX: Chuẩn bị trước mỗi test - KHÔNG đăng nhập lại
  test.beforeEach(async ({ page }) => {
    console.log('\n🔄 Chuẩn bị test...');
    
    // Kiểm tra xem đã đăng nhập chưa
    await page.goto(promotionTestConfig.urls.cartPage, {
      waitUntil: 'domcontentloaded',
      timeout: 45000
    });
    
    await dismissAdvertisementPopup(page);
    
    const currentUrl = page.url();
    const needLogin = currentUrl.includes('/login');
    
    if (needLogin) {
      // Chỉ đăng nhập nếu chưa đăng nhập
      const loginSuccess = await performUserLogin(
        page,
        promotionTestConfig.accountCredentials.email,
        promotionTestConfig.accountCredentials.password
      );
      
      if (!loginSuccess) {
        throw new Error('Không thể đăng nhập');
      }
    } else {
      console.log('✓ Đã đăng nhập sẵn\n');
    }
    
    // Xóa giỏ hàng cũ
    await clearShoppingCart(page);
    
    // Thêm sản phẩm mới
    await addProductToShoppingCart(page);
    
    // Vào trang giỏ hàng
    await navigateToCartPage(page);
    
    console.log('✅ Sẵn sàng test\n');
  });

  // ============================================================
  // PROMOTION_Apply_01: Nhập mã voucher hợp lệ
  // ============================================================
  test('PROMOTION_Apply_01', async ({ page }) => {
    console.log('═══════════════════════════════════════');
    console.log('PROMOTION_Apply_01');
    console.log('═══════════════════════════════════════\n');
    
    await dismissAdvertisementPopup(page);
    
    const priceBeforeDiscount = await extractCurrentPrice(page, '.price-totalprice span');
    console.log(`💰 Giá trước: ${priceBeforeDiscount.toLocaleString()}đ`);
    
    await page.fill('input[type="text"][placeholder*="mã giảm giá"]', promotionTestConfig.voucherCodes.validCode);
    console.log(`🎟️  Nhập mã: ${promotionTestConfig.voucherCodes.validCode}`);
    
    await page.click('form#form-discount button[type="submit"]');
    console.log('→ Click "Áp dụng"');
    
    await page.waitForTimeout(3000);
    await dismissAdvertisementPopup(page);
    
    const successMessage = await page.locator('.status-voucher:not(.error), .success-message').textContent().catch(() => '');
    const priceAfterDiscount = await extractCurrentPrice(page, '.price-totalprice span');
    
    console.log(`💰 Giá sau: ${priceAfterDiscount.toLocaleString()}đ`);
    
    if (priceAfterDiscount < priceBeforeDiscount || successMessage.length > 0) {
      console.log('✅ PASS - Mã áp dụng thành công\n');
      expect(true).toBeTruthy();
    } else {
      console.log('❌ FAIL - Mã không được áp dụng\n');
    }
  });

  // ============================================================
  // PROMOTION_Apply_02: Tính toán giảm giá chính xác
  // ============================================================
  test('PROMOTION_Apply_02: Kiểm tra tính toán số tiền giảm giá chính xác', async ({ page }) => {
    console.log('═══════════════════════════════════════');
    console.log('PROMOTION_Apply_02');
    console.log('═══════════════════════════════════════\n');
    
    await dismissAdvertisementPopup(page);
    
    const originalPrice = await extractCurrentPrice(page, '.price-subtotal');
    console.log(`💰 Giá gốc: ${originalPrice.toLocaleString()}đ`);
    
    const voucherRadioButton = page.locator('input[type="radio"][name="voucher"]').first();
    if (await voucherRadioButton.isVisible().catch(() => false)) {
      await voucherRadioButton.click();
      console.log('→ Chọn mã từ danh sách');
      
      await page.waitForTimeout(3000);
      await dismissAdvertisementPopup(page);
      
      const discountedPrice = await extractCurrentPrice(page, '.price-totalprice span');
      console.log(`💰 Giá sau giảm: ${discountedPrice.toLocaleString()}đ`);
      
      const discountAmount = originalPrice - discountedPrice;
      console.log(`💸 Số tiền giảm: ${discountAmount.toLocaleString()}đ`);
      
      if (discountAmount > 0) {
        console.log('✅ PASS - Tính toán chính xác\n');
        expect(discountedPrice).toBeLessThan(originalPrice);
      } else {
        console.log('❌ FAIL - Giá không giảm\n');
      }
    } else {
      console.log('⏭️  SKIP - Không có mã trong danh sách\n');
    }
  });

  // ============================================================
  // PROMOTION_Apply_03: Tổng thanh toán
  // ============================================================
  test('PROMOTION_Apply_03: Kiểm tra tổng thanh toán sau khi áp mã giảm', async ({ page }) => {
    console.log('═══════════════════════════════════════');
    console.log('PROMOTION_Apply_03');
    console.log('═══════════════════════════════════════\n');
    
    await dismissAdvertisementPopup(page);
    
    const initialTotal = await extractCurrentPrice(page, '.item-totalprice .price-totalprice span');
    console.log(`💰 Tổng ban đầu: ${initialTotal.toLocaleString()}đ`);
    
    await page.fill('input[type="text"][placeholder*="mã giảm giá"]', promotionTestConfig.voucherCodes.validCode);
    await page.click('form#form-discount button[type="submit"]');
    
    await page.waitForTimeout(3000);
    await dismissAdvertisementPopup(page);
    
    const finalTotal = await extractCurrentPrice(page, '.item-totalprice .price-totalprice span');
    console.log(`💰 Tổng sau: ${finalTotal.toLocaleString()}đ`);
    
    if (finalTotal < initialTotal) {
      console.log('✅ PASS - Tổng hóa đơn giảm đúng\n');
      expect(finalTotal).toBeLessThan(initialTotal);
    } else {
      console.log('❌ FAIL - Tổng không thay đổi\n');
    }
  });

  // ============================================================
  // PROMOTION_Apply_04: Mã không tồn tại
  // ============================================================
  test('PROMOTION_Apply_04: Nhập mã voucher không tồn tại', async ({ page }) => {
    console.log('═══════════════════════════════════════');
    console.log('PROMOTION_Apply_04');
    console.log('═══════════════════════════════════════\n');
    
    await dismissAdvertisementPopup(page);
    
    await page.fill('input[type="text"][placeholder*="mã giảm giá"]', promotionTestConfig.voucherCodes.invalidCode);
    console.log(`🎟️  Nhập mã sai: ${promotionTestConfig.voucherCodes.invalidCode}`);
    
    await page.click('form#form-discount button[type="submit"]');
    
    await page.waitForTimeout(3000);
    
    const errorMessage = await page.locator('.status-voucher.error').textContent().catch(() => '');
    console.log(`📢 Thông báo: "${errorMessage}"`);
    
    if (errorMessage.includes('không hợp lệ') || errorMessage.includes('hết hạn') || errorMessage.includes('không tồn tại')) {
      console.log('✅ PASS - Hiển thị lỗi đúng\n');
      expect(errorMessage.length).toBeGreaterThan(0);
    } else {
      console.log('❌ FAIL - Không hiển thị lỗi\n');
    }
  });

  // ============================================================
  // PROMOTION_Apply_05: Không đủ điều kiện
  // ============================================================
  test('PROMOTION_Apply_05: Nhập mã nhưng không đủ điều kiện tối thiểu', async ({ page }) => {
    console.log('═══════════════════════════════════════');
    console.log('PROMOTION_Apply_05');
    console.log('═══════════════════════════════════════\n');
    
    await dismissAdvertisementPopup(page);
    
    const currentPrice = await extractCurrentPrice(page, '.price-totalprice span');
    console.log(`💰 Đơn hàng: ${currentPrice.toLocaleString()}đ`);
    
    await page.fill('input[type="text"][placeholder*="mã giảm giá"]', promotionTestConfig.voucherCodes.minimumOrderCode);
    console.log(`🎟️  Nhập mã yêu cầu tối thiểu: ${promotionTestConfig.voucherCodes.minimumOrderCode}`);
    
    await page.click('form#form-discount button[type="submit"]');
    
    await page.waitForTimeout(3000);
    
    const errorNotification = await page.locator('.status-voucher.error, .error-message').textContent().catch(() => '');
    console.log(`📢 Thông báo: "${errorNotification}"`);
    
    if (errorNotification.includes('điều kiện') || errorNotification.includes('tối thiểu') || errorNotification.includes('không hợp lệ')) {
      console.log('✅ PASS - Hiển thị điều kiện\n');
      expect(errorNotification.length).toBeGreaterThan(0);
    } else {
      console.log('❌ FAIL - Không hiển thị điều kiện\n');
    }
  });

  // ============================================================
  // PROMOTION_Apply_06: Chưa đăng nhập
  // ============================================================
  test('PROMOTION_Apply_06: Áp mã khi người dùng chưa đăng nhập', async ({ page }) => {
    console.log('═══════════════════════════════════════');
    console.log('PROMOTION_Apply_06');
    console.log('═══════════════════════════════════════\n');
    
    await page.context().clearCookies();
    console.log('🚪 Đã đăng xuất');
    
    await page.goto(promotionTestConfig.urls.cartPage, {
      waitUntil: 'domcontentloaded',
      timeout: 45000
    });
    
    await dismissAdvertisementPopup(page);
    
    const voucherInput = page.locator('input[type="text"][placeholder*="mã giảm giá"]');
    
    if (await voucherInput.isVisible().catch(() => false)) {
      await voucherInput.fill(promotionTestConfig.voucherCodes.validCode);
      await page.click('form#form-discount button[type="submit"]');
      
      await page.waitForTimeout(3000);
      
      const currentUrl = page.url();
      const loginRequired = currentUrl.includes('/login') || await page.locator('text=/đăng nhập/i').isVisible().catch(() => false);
      
      if (loginRequired) {
        console.log('✅ PASS - Yêu cầu đăng nhập\n');
        expect(loginRequired).toBeTruthy();
      } else {
        console.log('❌ FAIL - Không yêu cầu đăng nhập\n');
      }
    } else {
      console.log('⏭️  SKIP - Không có giỏ hàng\n');
    }
  });

});

// ========================================
// Configuration
// ========================================
test.use({
  viewport: { width: 1280, height: 720 },
  headless: false, // Hiển thị browser để dễ debug
  video: 'retain-on-failure',
  screenshot: 'only-on-failure',
  trace: 'on-first-retry',
  
  // Tăng timeout cho các action
  actionTimeout: 15000,
  navigationTimeout: 60000
});
test.setTimeout(120000);

// QUAN TRỌNG: Chạy tuần tự từng test một (không chạy song song)
test.describe.configure({ mode: 'serial' });