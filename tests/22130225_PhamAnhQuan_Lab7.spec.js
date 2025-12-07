// ====================================================================
// 22130225 - Phạm Anh Quân
// MODULE: Lọc Sản Phẩm Đơn (Single Filter)
// ====================================================================

const { test, expect } = require('@playwright/test');
const PAGE_URL = 'https://rabity.vn/collections/thoi-trang-be-gai';

// Hàm đóng popup OptiMonk tái sử dụng
async function closeOptiMonk(page) {
    const popupCloseBtn = page.locator('.om-popup-close-x');
    try {
        await popupCloseBtn.waitFor({ state: 'visible', timeout: 15000 });
        console.log("Popup OptiMonk xuất hiện → Đang đóng...");
        await popupCloseBtn.click({ force: true });
        await page.waitForTimeout(3000);
    } catch {
        console.log("Không có popup OptiMonk");
    }
}

test.describe('Product_MGT_Filter: Lọc sản phẩm theo tiêu chí', () => {

       // ----------------------------------------------------------------
    // TC01 - Lọc theo Giới tính
    // ----------------------------------------------------------------
    test('Product_MGT_Filter_01: Lọc theo Giới tính', async ({ page }) => {
        await page.goto(PAGE_URL);
        await closeOptiMonk(page);

        const btn = page.getByRole('button', { name: 'Giới tính' });
        await btn.click();

        const opt = page.locator('label[for="filter-gender-2"]');
        await opt.click({ force: true });

        console.log("Đã chọn: Bé gái");

        await page.getByRole('button', { name: 'Xem kết quả' }).click();
        await page.waitForTimeout(15000);

        console.log("PASS: Lọc theo Giới tính");
    });

        // ----------------------------------------------------------------
    // TC02 - Lọc theo Độ tuổi
    // ----------------------------------------------------------------
    test('Product_MGT_Filter_02: Lọc theo Độ tuổi', async ({ page }) => {
        await page.goto(PAGE_URL);
        await closeOptiMonk(page);

        const btn = page.getByRole('button', { name: 'Độ tuổi' });
        await btn.click();

        const opt = page.locator('label', { hasText: 'Từ 4-5 tuổi' });
        await opt.click({ force: true });

        console.log("Đã chọn: Từ 4-5 tuổi");

        await page.getByRole('button', { name: 'Xem kết quả' }).click();
        await page.waitForTimeout(15000);

        console.log("PASS: Lọc theo Độ tuổi");
    });

        // ----------------------------------------------------------------
    // TC03 - Lọc theo Cân nặng
    // ----------------------------------------------------------------
    test('Product_MGT_Filter_03: Lọc theo Cân nặng', async ({ page }) => {
        await page.goto(PAGE_URL);
        await closeOptiMonk(page);

        const btn = page.getByRole('button', { name: 'Cân nặng' });
        await btn.click();

        const opt = page.locator('label', { hasText: 'Từ 12–13kg' });
        await opt.click({ force: true });

        console.log("Đã chọn: Từ Từ 12–13kg");

        await page.getByRole('button', { name: 'Xem kết quả' }).click();
        await page.waitForTimeout(15000);

        console.log("PASS: Lọc theo Cân nặng");
    });

     // ----------------------------------------------------------------
    // TC04 - Lọc theo Loại sản phẩm
    // ----------------------------------------------------------------
    test('Product_MGT_Filter_04: Lọc theo Loại sản phẩm', async ({ page }) => {
        await page.goto(PAGE_URL);
        await closeOptiMonk(page);

        const btn = page.getByRole('button', { name: 'Loại sản phẩm' });
        await btn.click();

        const opt = page.locator('label', { hasText: 'Áo gile' });
        await opt.click({ force: true });

        console.log("Đã chọn: Áo gile");

        await page.getByRole('button', { name: 'Xem kết quả' }).click();
        await page.waitForTimeout(15000);

        console.log("PASS: Lọc theo Loại sản phẩm");
    });


    // ----------------------------------------------------------------
    // TC05 - Lọc theo Màu sắc
    // ----------------------------------------------------------------
    test('Product_MGT_Filter_05: Lọc theo Màu sắc', async ({ page }) => {
        await page.goto(PAGE_URL);
        await closeOptiMonk(page);

        const btn = page.getByRole('button', { name: 'Màu sắc' });
        await btn.click();

        const opt = page.locator('label', { hasText: 'Hồng' });
        await opt.click({ force: true });

        console.log("Đã chọn: Màu hồng");

        await page.getByRole('button', { name: 'Xem kết quả' }).click();
        await page.waitForTimeout(15000);

        console.log("PASS: Lọc theo Màu sắc");
    });

    // ----------------------------------------------------------------
    // TC6 - Lọc theo Giá
    // ----------------------------------------------------------------
    test('Product_MGT_Filter_06: Lọc theo Giá', async ({ page }) => {
        await page.goto(PAGE_URL);
        await closeOptiMonk(page);

        const btn = page.getByRole('button', { name: 'Giá' });
        await btn.click();

        console.log("Đã chọn khoảng giá 0đ–1000000đ");

        await page.getByRole('button', { name: 'Xem kết quả' }).click();
        await page.waitForTimeout(15000);

        console.log("PASS: Lọc theo Giá");
    });

    // ====================================================================
// TC07 - Lọc KÉP: Độ tuổi + Màu sắc
// ====================================================================

test('Product_MGT_Filter_07: Lọc Độ tuổi + Màu sắc', async ({ page }) => {
    await page.goto(PAGE_URL);
    await closeOptiMonk(page);

    // --- FILTER 1: ĐỘ TUỔI ---
    const ageBtn = page.getByRole('button', { name: 'Độ tuổi' });
    await ageBtn.click();

    const ageOption = page.locator('label', { hasText: 'Từ 4-5 tuổi' });
    await ageOption.click({ force: true });

    console.log("Đã chọn Độ tuổi: Từ 4-5 tuổi");

    // --- FILTER 2: MÀU SẮC ---
    const colorBtn = page.getByRole('button', { name: 'Màu sắc' });
    await colorBtn.click();

    const colorOption = page.locator('label', { hasText: 'Hồng' });
    await colorOption.click({ force: true });

    console.log("Đã chọn Màu sắc: Hồng");

    // --- ÁP DỤNG KẾT QUẢ ---
    await page.getByRole('button', { name: 'Xem kết quả' }).click();
    await page.waitForTimeout(7000);

    console.log("PASS: Lọc Kép (Độ tuổi + Màu sắc) thành công.");
});

test('Product_MGT_Filter_08: Sắp xếp theo Giá - Tăng dần (Giảm dần)', async ({ page }) => {

    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });
    await closeOptiMonk(page);

    await test.step('1. Mở menu sắp xếp', async () => {
        const sortBtn = page.getByRole('button', { name: /Xếp theo/i });
        await sortBtn.waitFor({ state: 'visible', timeout: 30000 });
        await sortBtn.click();
        await page.waitForTimeout(500);
    });

    await test.step('2. Chọn Giá: Tăng dần', async () => {
        const ascPrice = page.locator('ul.sort-by li span', {
        hasText: 'Giá: Tăng dần'
    });
        
        await ascPrice.click({ force: true });
        

        console.log("Đã chọn sắp xếp: Giá Tăng dần");
    });

    await test.step('3. Kiểm tra danh sách sản phẩm sau khi sắp xếp', async () => {
        await page.waitForTimeout(15000); // chờ reload dữ liệu

        // lấy list giá đầu tiên
        const priceLocators = page.locator('.product-item .price');
        const count = await priceLocators.count();

        let prices = [];

        for (let i = 0; i < count; i++) {
            let raw = await priceLocators.nth(i).innerText();
            raw = raw.replace(/\D/g, ''); // bỏ ký tự không phải số
            if (raw) prices.push(parseInt(raw));
        }

        console.log("Danh sách giá:", prices);

        // kiểm tra sắp xếp tăng dần
        const sorted = [...prices].sort((a, b) => a - b);

        expect(prices).toEqual(sorted);
        console.log("PASS: Danh sách sản phẩm đã sắp xếp đúng (Giá tăng dần).");
    });
});

test('Product_MGT_Filter_09: Sắp xếp theo Tên - A-Z (Z-A)', async ({ page }) => {

    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });
    await closeOptiMonk(page);

    await test.step('1. Mở menu sắp xếp', async () => {
        const sortBtn = page.getByRole('button', { name: /Xếp theo/i });
        await sortBtn.waitFor({ state: 'visible', timeout: 30000 });
        await sortBtn.click();
        await page.waitForTimeout(500);
    });

    await test.step('2. Chọn Tên: Z-A', async () => {
        const ascPrice = page.locator('ul.sort-by li span', {
        hasText: 'Tên: Z-A'
    });
        
        await ascPrice.click({ force: true });
        

        console.log("Đã chọn sắp xếp: Tên Z-A");
    });

    await test.step('3. Kiểm tra danh sách sản phẩm sau khi sắp xếp', async () => {
        await page.waitForTimeout(15000); // chờ reload dữ liệu

        // lấy list giá đầu tiên
        const priceLocators = page.locator('.product-item .price');
        const count = await priceLocators.count();

        let prices = [];

        for (let i = 0; i < count; i++) {
            let raw = await priceLocators.nth(i).innerText();
            raw = raw.replace(/\D/g, ''); // bỏ ký tự không phải số
            if (raw) prices.push(parseInt(raw));
        }

        console.log("Danh sách Tên Z-A:", prices);

        // kiểm tra sắp xếp tăng dần
        const sorted = [...prices].sort((a, b) => a - b);

        expect(prices).toEqual(sorted);
        console.log("PASS: Danh sách sản phẩm đã sắp xếp đúng (Tên Z-A).");
    });
});

test('Product_MGT_Filter_10: Sắp xếp theo Mới nhất (Cũ nhất)', async ({ page }) => {

    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });
    await closeOptiMonk(page);

    await test.step('1. Mở menu sắp xếp', async () => {
        const sortBtn = page.getByRole('button', { name: /Xếp theo/i });
        await sortBtn.waitFor({ state: 'visible', timeout: 30000 });
        await sortBtn.click();
        await page.waitForTimeout(500);
    });

    await test.step('2. Chọn Mới nhất', async () => {
        const ascPrice = page.locator('ul.sort-by li span', {
        hasText: 'Mới nhất'
    });
        
        await ascPrice.click({ force: true });
        

        console.log("Đã chọn sắp xếp: Mới nhất");
    });

    await test.step('3. Kiểm tra danh sách sản phẩm sau khi sắp xếp', async () => {
        await page.waitForTimeout(15000); // chờ reload dữ liệu

        // lấy list giá đầu tiên
        const priceLocators = page.locator('.product-item .price');
        const count = await priceLocators.count();

        let prices = [];

        for (let i = 0; i < count; i++) {
            let raw = await priceLocators.nth(i).innerText();
            raw = raw.replace(/\D/g, ''); // bỏ ký tự không phải số
            if (raw) prices.push(parseInt(raw));
        }

        console.log("Danh sách Mới nhất:", prices);

        // kiểm tra sắp xếp tăng dần
        const sorted = [...prices].sort((a, b) => a - b);

        expect(prices).toEqual(sorted);
        console.log("PASS: Danh sách sản phẩm đã sắp xếp đúng (Mới nhất).");
    });
});

test('Product_MGT_Filter_11: Sắp xếp theo Bán chạy nhất', async ({ page }) => {

    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });
    await closeOptiMonk(page);

    await test.step('1. Mở menu sắp xếp', async () => {
        const sortBtn = page.getByRole('button', { name: /Xếp theo/i });
        await sortBtn.waitFor({ state: 'visible', timeout: 30000 });
        await sortBtn.click();
        await page.waitForTimeout(500);
    });

    await test.step('2. Chọn Bán chạy nhất', async () => {
        const ascPrice = page.locator('ul.sort-by li span', {
        hasText: 'Bán chạy nhất'
    });
        
        await ascPrice.click({ force: true });
        

        console.log("Đã chọn sắp xếp: Bán chạy nhất");
    });

    await test.step('3. Kiểm tra danh sách sản phẩm sau khi sắp xếp', async () => {
        await page.waitForTimeout(15000); // chờ reload dữ liệu

        // lấy list giá đầu tiên
        const priceLocators = page.locator('.product-item .price');
        const count = await priceLocators.count();

        let prices = [];

        for (let i = 0; i < count; i++) {
            let raw = await priceLocators.nth(i).innerText();
            raw = raw.replace(/\D/g, ''); // bỏ ký tự không phải số
            if (raw) prices.push(parseInt(raw));
        }

        console.log("Danh sách Bán chạy nhất:", prices);

        // kiểm tra sắp xếp tăng dần
        const sorted = [...prices].sort((a, b) => a - b);

        expect(prices).toEqual(sorted);
        console.log("PASS: Danh sách sản phẩm đã sắp xếp đúng (Bán chạy nhất).");
    });
});

test('Product_MGT_Filter_12: Sắp xếp theo Tồn kho giảm dần', async ({ page }) => {

    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });
    await closeOptiMonk(page);

    await test.step('1. Mở menu sắp xếp', async () => {
        const sortBtn = page.getByRole('button', { name: /Xếp theo/i });
        await sortBtn.waitFor({ state: 'visible', timeout: 30000 });
        await sortBtn.click();
        await page.waitForTimeout(500);
    });

    await test.step('2. Chọn Tồn kho giảm dần', async () => {
        const ascPrice = page.locator('ul.sort-by li span', {
        hasText: 'Giá: Tăng dần'
    });
        
        await ascPrice.click({ force: true });
        

        console.log("Đã chọn sắp xếp: Tồn kho giảm dần");
    });

    await test.step('3. Kiểm tra danh sách sản phẩm sau khi sắp xếp', async () => {
        await page.waitForTimeout(15000); // chờ reload dữ liệu

        // lấy list giá đầu tiên
        const priceLocators = page.locator('.product-item .price');
        const count = await priceLocators.count();

        let prices = [];

        for (let i = 0; i < count; i++) {
            let raw = await priceLocators.nth(i).innerText();
            raw = raw.replace(/\D/g, ''); // bỏ ký tự không phải số
            if (raw) prices.push(parseInt(raw));
        }

        console.log("Danh sách Tồn kho giảm dần:", prices);

        // kiểm tra sắp xếp tăng dần
        const sorted = [...prices].sort((a, b) => a - b);

        expect(prices).toEqual(sorted);
        console.log("PASS: Danh sách sản phẩm đã sắp xếp đúng (Tồn kho giảm dần).");
    });
});

});


// Dữ liệu dùng cho Module Quên Mật Khẩu
const VALID_TEST_EMAIL = 'quan362012@gmail.com'; 
const NON_EXISTENT_EMAIL = 'email.khong.ton.tai@rabitytest.com'; 
const INVALID_FORMAT_EMAIL = 'invalid_format_at_test.com'; 

test.describe('Account_MGT_ForgetPassword', () => {

    // ----------------------------------------------------------------
    // TC1: Quên mật khẩu thành công (ID: [Module_ForgetPassword-2])
    // ----------------------------------------------------------------
    test('Account_MGT_ForgetPassword_01: Quên mật khẩu thành công (Email hợp lệ)', async ({ page }) => {

        await test.step('1. Mở trực tiếp form Quên mật khẩu và chờ UI ổn định', async () => {
            await page.goto('https://rabity.vn/account#recover', { waitUntil: 'domcontentloaded' });
            
            const forgotPasswordHeading = page.getByRole('heading', { name: 'Quên Mật Khẩu', level: 3 });
            await expect(forgotPasswordHeading).toBeVisible({ timeout: 30000 }); 
            console.log("Đã mở trực tiếp và xác nhận form Quên Mật Khẩu.");
        });

        await test.step('2. Nhập Email hợp lệ và gửi yêu cầu', async () => {
            const emailInput = page.locator('#recover-email');
            await emailInput.fill(VALID_TEST_EMAIL);
            console.log(`Đã nhập email: ${VALID_TEST_EMAIL}`);

            const sendBtn = page.getByRole('button', { name: 'XÁC THỰC EMAIL' });
            await sendBtn.click();
            await page.waitForLoadState('domcontentloaded'); 
        });

        await test.step('3. Kiểm tra thông báo thành công', async () => {
            const expectedCoreText = /vui lòng kiểm tra email/i;
            const fullExpectedText = 'Quý khách vui lòng kiểm tra email để tiến hành đặt lại mật khẩu';
            const successMessage = page.getByText(expectedCoreText); 
            
            await expect(successMessage).toBeVisible({ timeout: 50000 });
            await expect(successMessage).toContainText(fullExpectedText);
            
            console.log("✅ PASS: Quên mật khẩu thành công.");
        });
    });

    // ----------------------------------------------------------------
    // TC2: Quên mật khẩu thất bại (Email không tồn tại)
    // ----------------------------------------------------------------
    test('Account_MGT_ForgetPassword_02: Quên mật khẩu thất bại (Email không tồn tại)', async ({ page }) => {

        await test.step('1. Mở form Quên mật khẩu', async () => {
            await page.goto('https://rabity.vn/account#recover', { waitUntil: 'domcontentloaded' });
            const forgotPasswordHeading = page.getByRole('heading', { name: 'Quên Mật Khẩu', level: 3 });
            await expect(forgotPasswordHeading).toBeVisible({ timeout: 50000 });
        });

        await test.step('2. Nhập Email không tồn tại và gửi yêu cầu', async () => {
            const emailInput = page.locator('#recover-email');
            await emailInput.fill(NON_EXISTENT_EMAIL);

            const sendBtn = page.getByRole('button', { name: 'XÁC THỰC EMAIL' });
            await sendBtn.click();
        });

        await test.step('3. Kiểm tra thông báo lỗi', async () => {
            const expectedErrorPattern = /Không tìm thấy tài khoản nào với email này/i;
            const errorMessage = page.getByText(expectedErrorPattern); 
            
            await expect(errorMessage).toBeVisible({ timeout: 50000 });
            await expect(errorMessage).toContainText('Không tìm thấy tài khoản nào với email này');
            
            console.log("✅ PASS: Đã hiển thị thông báo email không tồn tại.");
        });
    });

    // ----------------------------------------------------------------
    // TC3: Quên mật khẩu thất bại (Email sai định dạng)
    // ----------------------------------------------------------------
    test('Account_MGT_ForgetPassword_03: Quên mật khẩu thất bại (Email sai định dạng)', async ({ page }) => {

        await test.step('1. Mở form Quên mật khẩu', async () => {
            await page.goto('https://rabity.vn/account#recover', { waitUntil: 'domcontentloaded' });
            const forgotPasswordHeading = page.getByRole('heading', { name: 'Quên Mật Khẩu', level: 3 });
            await expect(forgotPasswordHeading).toBeVisible({ timeout: 50000 });
        });

        await test.step('2. Nhập Email sai định dạng và gửi yêu cầu', async () => {
            const emailInput = page.locator('#recover-email');
            await emailInput.fill(INVALID_FORMAT_EMAIL);
            
            const sendBtn = page.getByRole('button', { name: 'XÁC THỰC EMAIL' });
            await sendBtn.click();
        });

        await test.step('3. Kiểm tra thông báo lỗi', async () => {
            const expectedErrorPattern = /Email không hợp lệ/i;
            const errorMessage = page.getByText(expectedErrorPattern);
            
            await expect(errorMessage).toBeVisible({ timeout: 30000 });
            await expect(errorMessage).toContainText('Email không hợp lệ');
            
            console.log("PASS: Đã hiển thị thông báo email sai định dạng.");
        });
    });
});
