// 22130313_VoVanQuocTuan_Lab7.spec.js
// Assignment 7 & 8 - Profile Management + Quản lý giỏ hàng
// Sinh viên: Võ Văn Quốc Tuấn - 22130313

import { test, expect } from '@playwright/test';

const USER = {
    email: '22130313@st.hcmuaf.edu.vn',
    password: '123456789@Aa'
};

// HÀM ĐÓNG POPUP
const closePopup = async (page) => {
    const popup = page.locator('span.om-popup-close-x');
    const count = await popup.count();
    if (count > 0) {
        try {
            await popup.first().waitFor({ state: 'visible', timeout: 1000 });
            await popup.first().click();
            await page.waitForTimeout(200);
            console.log('✓ Popup đã đóng');
        } catch {
            console.log('✓ Không cần đóng popup');
        }
    } else {
        console.log('✓ Không có popup');
    }
};

// ============================================================
// ASSIGNMENT 7 - PROFILE MANAGEMENT
// ============================================================

test.describe('Assignment 7 - Profile_MGT', () => {

    test.beforeEach(async ({ page }) => {
        console.log('=== beforeEach: Đăng nhập và vào trang Profile ===');

        // 1. Đăng nhập vào hệ thống bằng email + mật khẩu hợp lệ.
        await page.goto('https://rabity.vn/account/login');
        await closePopup(page);
        await page.fill('#login-email', USER.email);
        await page.fill('#password', USER.password);
        await closePopup(page);
        await page.click('button.btn-login-form-page');

        //2. Vào trang Profile.
        // Chờ đăng nhập thành công → chuyển hướng về trang chủ hoặc profile
        await expect(page).toHaveURL(/rabity\.vn/, { timeout: 15000 });

        console.log('Đã vào trang Profile');
    });

    // Helper lấy toast message
    const getToastMessage = async (page) => {
        // Các selector 
        const toastSelector = '.toast .toast-body';

        try {
            // Lấy locator của toast đầu tiên hiển thị
            const toast = page.locator(toastSelector).first();

            //  Chờ toast xuất hiện và có text
            await toast.waitFor({ state: 'visible' });
            await expect(toast).toHaveText(/.+/, { timeout: 5000 });

            // Lấy nội dung toast
            const message = await toast.innerText();
            console.log("Message response:", message);
            return message;

        } catch (error) {
            // Nếu không tìm thấy toast hoặc timeout, trả về chuỗi rỗng
            return '';
        }
    };

    test('[Profile_MGT_Update_01] Kiểm tra layout đầy đủ các trường', async ({ page }) => {
        console.log('\n>>> RUN: Profile_MGT_Update_01 - Kiểm tra layout');

        //3. Xác nhận tất cả các trường cần thiết
        await expect(page.locator('#input-lastname-update')).toBeVisible();
        await expect(page.locator('#input-firstname-update')).toBeVisible();
        await expect(page.locator('#input-birthday-update')).toBeVisible();
        await expect(page.locator('#input-gender-update')).toBeVisible();
        await expect(page.locator('button.btn-update-profile')).toBeVisible();

        console.log('Tất cả các trường đều hiển thị');
    });

    test('[Profile_MGT_Update_02] Kiểm tra giá trị mặc định đã có sẵn', async ({ page }) => {
        console.log('\n>>> RUN: Profile_MGT_Update_02 - Giá trị mặc định');

        //3. Kiểm tra giá trị trong các trường:- Họ- Tên
        await expect(page.locator('#input-lastname-update')).not.toHaveValue('');
        await expect(page.locator('#input-firstname-update')).not.toHaveValue('');

        console.log('Họ và tên đã có giá trị mặc định');
    });

    test('[Profile_MGT_Update_03] Giới hạn ký tự họ tên (quá dài)', async ({ page }) => {
        console.log('\n>>> RUN: Profile_MGT_Update_03 - Họ quá dài (100 ký tự)');

        //3. Xóa giá trị hiện tại trong trường Họ.
        await page.locator('#input-lastname-update').clear();
        //4. Nhập 100 ký tự vào trường Họ.
        await page.locator('#input-lastname-update').fill('A'.repeat(100));

        //5. Nhấn nút "Cập nhật".
        await page.locator('button.btn-update-profile').click();

        //6. Lấy thông báo (toast message) hiển thị sau khi nhấn cập nhật.
        const msg = await getToastMessage(page);
        expect(msg.toLowerCase()).not.toContain('thành công');
        expect(msg).toMatch(/lỗi|quá|giới hạn|ký tự|không được vượt/i);

        console.log('Hệ thống chặn họ quá dài');
    });

    test('[Profile_MGT_Update_04] Cập nhật thông tin hợp lệ', async ({ page }) => {
        console.log('\n>>> RUN: Profile_MGT_Update_04 - Cập nhật thành công');

        //3. Nhập giá trị hợp lệ cho các trường:  - Họ: "Võ"  - Tên: "Quốc Tuấn"  - Ngày sinh: "1995-05-20"  - Giới tính: "Nam"
        await page.locator('#input-lastname-update').fill('Võ');
        await page.locator('#input-firstname-update').fill('Quốc Tuấn');
        await page.locator('#input-birthday-update').fill('1995-05-20');
        await page.locator('#input-gender-update').selectOption('Nam');

        //4. Nhấn nút "Cập nhật".
        await page.locator('button.btn-update-profile').click();

        //5. Lấy thông báo (toast message) hiển thị sau khi nhấn cập nhật.
        const msg = await getToastMessage(page);
        expect(msg.toLowerCase()).toContain('thành công');

        console.log('Cập nhật profile thành công');
    });

    test('[Profile_MGT_Update_05] Ngày sinh trong tương lai (không hợp lệ)', async ({ page }) => {
        console.log('\n>>> RUN: Profile_MGT_Update_05 - Ngày sinh tương lai');

        //3. Nhập ngày sinh trong tương lai (ví dụ: +5 năm so với hiện tại).
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 5);
        const formatted = futureDate.toISOString().split('T')[0]; // YYYY-MM-DD

        //4. Nhấn nút "Cập nhật".
        await page.locator('#input-birthday-update').fill(formatted);
        await page.locator('button.btn-update-profile').click();

        //5. Lấy thông báo (toast message) hiển thị sau khi nhấn cập nhật
        const msg = await getToastMessage(page);
        expect(msg.toLowerCase()).not.toContain('thành công');
        expect(msg).toMatch(/lỗi|ngày sinh|không hợp lệ/i);

        console.log('Hệ thống chặn ngày sinh tương lai');
    });

    test('[Profile_MGT_Update_06] Bỏ trống trường Họ (bắt buộc)', async ({ page }) => {
        console.log('\n>>> RUN: Profile_MGT_Update_06 - Bỏ trống Họ');

        //3. Xóa nội dung trường Họ.
        await page.locator('#input-lastname-update').clear();
        //4. Điền tên hợp lệ vào trường Tên.
        await page.locator('#input-firstname-update').fill('Tuấn'); // giữ tên hợp lệ
        //5. Nhấn nút "Cập nhật".
        await page.locator('button.btn-update-profile').click();

        // 6. Kiểm tra thông báo lỗi inline (span.text-error) xuất hiện dưới trường Họ.
        await expect(
            page.locator('span.text-error').filter({
                hasText: /Họ.*(không được bỏ trống|bắt buộc)/i
            })
        ).toBeVisible({ timeout: 5000 });

        console.log('Lỗi inline "Họ không được bỏ trống" hiển thị đúng');
    });

    test('[Profile_MGT_Update_07] Nhập ký tự đặc biệt vào Họ', async ({ page }) => {
        console.log('\n>>> RUN: Profile_MGT_Update_07 - Ký tự đặc biệt trong Họ');

        //3. Nhập ký tự đặc biệt vào trường Họ, ví dụ: "Võ @#$%^&*()".
        await page.locator('#input-lastname-update').fill('Võ @#$%^&*()');
        //4. Nhấn nút "Cập nhật".
        await page.locator('button.btn-update-profile').click();

        //5. Kiểm tra thông báo lỗi (toast message hoặc inline).
        const msg = await getToastMessage(page);
        expect(msg.toLowerCase()).not.toContain('thành công');
        expect(msg).toMatch(/lỗi|ký tự|không hợp lệ/i);

        console.log('Hệ thống chặn ký tự đặc biệt trong Họ');
    });

    test('[Profile_MGT_Update_08] Nhập khoảng trắng (space) vào trường Họ', async ({ page }) => {
        console.log('\n>>> [Profile_MGT_Update_08] Nhập khoảng trắng (space) vào trường Họ');

        //3. Nhập khoảng trắng vào trường Họ.
        await page.locator('#input-lastname-update').fill('           ');
        //4. Nhấn nút "Cập nhật".
        await page.locator('button.btn-update-profile').click();

        //5. Kiểm tra thông báo lỗi (toast message hoặc inline).
        const msg = await getToastMessage(page);
        expect(msg.toLowerCase()).not.toContain('thành công');
        await expect(
            page.locator('span.text-error').filter({
                hasText: /Họ.*(không được bỏ trống|bắt buộc)/i
            })
        ).toBeVisible({ timeout: 5000 });

        console.log('Hệ thống chặn ký tự đặc biệt trong Họ');
    });

    test('[Profile_MGT_Update_09] Định dạng ngày sinh sai (nhập text)', async ({ page }) => {
        console.log('\n>>> [Profile_MGT_Update_09] Định dạng ngày sinh sai (nhập text)');

        //3. Nhập thông tin vào trường họ tên để bỏ qua thông báo.
        await page.locator('#input-lastname-update').fill('VO');
        await page.locator('#input-firstname-update').fill('Tuấn');

        //4. Nhập vào trường ngày sinh bằng một chuỗi bất kì.
        await page.locator('#input-birthday-update').fill('KKKKKK');

        //5. Nhấn nút "Cập nhật".
        await page.locator('button.btn-update-profile').click();

        //6. Kiểm tra thông báo lỗi 
        const msg = await getToastMessage(page);
        expect(msg.toLowerCase()).not.toContain('thành công');
        expect(msg).toMatch(/lỗi|ngày sinh|không hợp lệ/i);

        console.log('Hệ thống chặn ký tự đặc biệt trong Họ');
    });

});

// ============================================================
// ASSIGNMENT 7 - CART MANAGEMENT
// ============================================================

test.describe('ASSIGNMENT 7 - Cart_MGT', () => {

    test.beforeEach(async ({ page }) => {
        console.log('=== beforeEach: Đăng nhập + Dọn sạch giỏ + Vào danh mục sản phẩm ===');

        // 1. Đăng nhập
        await page.goto('https://rabity.vn/account/login');
        await closePopup(page);
        await page.fill('#login-email', USER.email);
        await page.fill('#password', USER.password);
        await closePopup(page);
        await page.click('button.btn-login-form-page');
        await expect(page).toHaveURL(/rabity\.vn/, { timeout: 20000 });
        //2. Xác nhận đăng nhập thành công.
        console.log('Đã đăng nhập');
        await closePopup(page);

        // 3. Dọn giỏ hàng: vào giỏ hàng, xóa hết sản phẩm nếu có, xác nhận giỏ trống
        await page.locator('.cart-header > a[href="/cart"]').click();
        await page.waitForTimeout(1000); // chờ popup update
        await closePopup(page);
        while (await page.locator('.item-cart').count() > 0) {
            await page.locator('a.cart-remove, a[href*="cart/change"], a.cart').first().click({ force: true });
            await page.waitForTimeout(600);
        }
        await expect(page.locator('.item-cart')).toHaveCount(0);
        console.log('Giỏ hàng đã sạch');

        // 4. Vào trang danh sách sản phẩm theo danh mục.
        await page.goto('https://rabity.vn/collections/giay-tre-em');
        await closePopup(page);
        await expect(page.locator('.product-loop').first()).toBeVisible({ timeout: 10000 });
        await closePopup(page);
        console.log('Đã vào trang danh mục\n');
    });

    // ===== HELPER FUNCTIONS =====
    const getCartCount = async (page) => {
        try {
            const count = await page.locator('.count-item').first().innerText();
            return parseInt(count) || 0;
        } catch {
            return 0;
        }
    };

    const getSuccessMessage = async (page) => {
        const popup = page.locator('.cart-popup__title');
        try {
            await popup.waitFor({ state: 'visible', timeout: 2000 });
            const msg = await popup.innerText();
            console.log(`✓ Message: ${msg}`);
            return msg.trim();
        } catch {
            return '';
        }
    };

    const getErrorMessage = async (page) => {
        const toast = page.locator('.toast .toast-body').first();
        try {
            await toast.waitFor({ state: 'visible', timeout: 3000 });
            const message = await toast.innerText();
            console.log(`✓ Error: ${message}`);
            return message;
        } catch {
            return '';
        }
    };

    // ===== CÁC TEST CASE ĐƯỢC HARD-CODE =====

    test('[Cart_MGT_ADD_01] Thêm sản phẩm vào giỏ hàng bằng Quick Add từ danh sách sản phẩm', async ({ page }) => {
        console.log('\n>>> RUN: Cart_MGT_ADD_01 - Quick Add từ danh sách');

        //5. Lấy số lượng giỏ hàng hiện tại (initialCount).
        const initialCount = await getCartCount(page);
        //6. Chọn sản phẩm đầu tiên: scroll vào view và hover để hiện nút Quick Add.
        const product = page.locator('.product-loop').first();
        await product.scrollIntoViewIfNeeded();
        await product.hover();
        await page.waitForTimeout(600);
        await closePopup(page);

        //7. Click nút "Quick Add".
        await product.locator('.addtocart-loop-quickbuy').click({ force: true });
        //8. Chọn size hợp lệ trong ul.size-list li:not(.disabled) có text chứa số hoặc Y.
        await page.locator('ul.size-list li:not(.disabled)').filter({ hasText: /[0-9Y]/ }).first().click();

        //9. Chờ thông báo popup thành công, xác nhận hiển thị "Đã thêm vào giỏ hàng".
        const msg = await getSuccessMessage(page);
        expect(msg).toContain('Đã thêm vào giỏ hàng');

        //10. Kiểm tra số lượng giỏ hàng sau khi thêm = initialCount + 1.
        const finalCount = await getCartCount(page);
        expect(finalCount).toBe(initialCount + 1);
        console.log(`✓ PASS: ${initialCount} → ${finalCount}`);
    });

    test('[Cart_MGT_ADD_02] Thêm sản phẩm vào giỏ hàng bằng Quick Add  với lựa chọn màu, size và số lượng', async ({ page }) => {
        console.log('\n>>> RUN: Cart_MGT_ADD_02 - Thêm 2 sản phẩm');

        //5. Lấy số lượng giỏ hàng hiện tại (initialCount).
        const initialCount = await getCartCount(page);
        //6. Chọn sản phẩm đầu tiên: scroll vào view và hover để hiện nút Quick Add.
        const product = page.locator('.product-loop').first();
        await product.scrollIntoViewIfNeeded();
        await product.hover();
        await page.waitForTimeout(600);
        await closePopup(page);

        //7. Click nút "Thêm vào giỏ hàng" (Quick Add).
        await product.locator('.addtocart-loop').click({ force: true });

        //8. Chờ popup Quick Add load, đóng popup quảng cáo nếu có.
        await page.waitForTimeout(1500);
        await closePopup(page);

        //9. Chọn màu sản phẩm (option1) bằng cách click label đầu tiên.
        await page.locator('.item-option-color .list-option .item-variant label').first().click();
        //10. Chọn kích thước (option2) bằng cách click label đầu tiên.
        await page.locator('.normal-item .list-option .item-variant label').first().click();

        //11. Nhập số lượng = 2.
        const qtyInput = page.locator('input[type="number"], input.input-quantity, input[name="quantity"]').first();
        await qtyInput.fill('2');

        //12. Nhấn "Thêm vào giỏ hàng".
        await page.click('button.addtocart-detail-qv:has-text("Thêm vào giỏ hàng")');
        await page.waitForTimeout(2000);

        //13. Kiểm tra số lượng giỏ hàng = initialCount + 2.
        const finalCount = await getCartCount(page);
        expect(finalCount).toBe(initialCount + 2);
        console.log(`✓ PASS: ${initialCount} → ${finalCount} (+2)`);
    });

    test('[Cart_MGT_ADD_03] Thêm sản phẩm khi số lượng tồn kho ≥ số lượng yêu cầu.', async ({ page }) => {
        console.log('\n>>> RUN: Cart_MGT_ADD_03 - Thêm 3 sản phẩm');

        //5. Lấy số lượng giỏ hàng hiện tại (initialCount).
        const initialCount = await getCartCount(page);
        //6. Chọn sản phẩm đầu tiên: scroll và hover để hiện nút "Thêm vào giỏ hàng".
        const product = page.locator('.product-loop').first();
        await product.scrollIntoViewIfNeeded();
        await product.hover();
        await page.waitForTimeout(600);
        await closePopup(page);
        //7. Click nút "Thêm vào giỏ hàng" (Quick Add).
        await product.locator('.addtocart-loop').click({ force: true });

        //8. Chờ popup Quick Add load, đóng popup quảng cáo nếu có.
        await page.waitForTimeout(1500);
        await closePopup(page);

        //9. Chọn màu sản phẩm (option1) bằng cách click label đầu tiên.
        await page.locator('.item-option-color .list-option .item-variant label').first().click();
        //10. Chọn kích thước (option2) bằng cách click label đầu tiên.
        await page.locator('.normal-item .list-option .item-variant label').first().click();

        //11. Nhập số lượng = 3.
        const qtyInput = page.locator('input[type="number"], input.input-quantity, input[name="quantity"]').first();
        await qtyInput.fill('3');

        //12. Nhấn "Thêm vào giỏ hàng".
        await page.click('button.addtocart-detail-qv:has-text("Thêm vào giỏ hàng")');
        await page.waitForTimeout(2000);

        //13. Kiểm tra số lượng giỏ hàng = initialCount + 3.
        const finalCount = await getCartCount(page);
        expect(finalCount).toBe(initialCount + 3);
        console.log(`✓ PASS: ${initialCount} → ${finalCount} (+3)`);
    });

    test('[Cart_MGT_ADD_04] Thêm sản phẩm vượt quá số lượng tồn kho', async ({ page }) => {
        console.log('\n>>> RUN: Cart_MGT_ADD_04 - Vượt tồn kho');

        //5. Lấy số lượng giỏ hàng hiện tại (initialCount).
        const initialCount = await getCartCount(page);
        //6. Chọn sản phẩm đầu tiên: scroll và hover để hiện nút "Thêm vào giỏ hàng".
        const product = page.locator('.product-loop').first();
        await product.scrollIntoViewIfNeeded();
        await product.hover();
        await page.waitForTimeout(600);
        await closePopup(page);
        //7. Click nút "Thêm vào giỏ hàng" (Quick Add).
        await product.locator('.addtocart-loop').click({ force: true });

        //8. Chờ popup Quick Add load, đóng popup quảng cáo nếu có.
        await page.waitForTimeout(1500);
        await closePopup(page);

        //9. Chọn màu sản phẩm (option1) bằng cách click label đầu tiên.
        await page.locator('.item-option-color .list-option .item-variant label').first().click();
        //10. Chọn kích thước (option2) bằng cách click label đầu tiên.
        await page.locator('.normal-item .list-option .item-variant label').first().click();

        //11. Nhập số lượng = 999 (quá số lượng tồn kho).
        const qtyInput = page.locator('input[type="number"], input.input-quantity, input[name="quantity"]').first();
        await qtyInput.fill('999');

        //12. Nhấn "Thêm vào giỏ hàng".
        await page.click('button.addtocart-detail-qv:has-text("Thêm vào giỏ hàng")');
        await page.waitForTimeout(2000);

        //13. Xác nhận hiển thị thông báo lỗi ("không", "vượt", "giới hạn", "tồn kho").
        const msg = await getErrorMessage(page);
        expect(msg.toLowerCase()).toMatch(/không|vượt|giới hạn|tồn kho/);

        //14. Kiểm tra giỏ hàng không tăng, vẫn bằng initialCount.
        const finalCount = await getCartCount(page);
        expect(finalCount).toBe(initialCount);
        console.log(`✓ PASS: Hệ thống chặn → Giỏ vẫn ${finalCount}`);
    });

    test('[Cart_MGT_ADD_05] Kiểm tra hiển thị giỏ hàng sau khi thêm sản phẩm.', async ({ page }) => {
        console.log('\n>>> RUN: Cart_MGT_ADD_05 - Verify thông tin trong giỏ');

        //5. Lấy số lượng giỏ hàng hiện tại (initialCount).
        const initialCount = await getCartCount(page);
        //6. Chọn sản phẩm đầu tiên: hover và click "Thêm vào giỏ hàng" (Quick Add).
        const product = page.locator('.product-loop').first();
        await product.scrollIntoViewIfNeeded();
        await product.hover();
        await page.waitForTimeout(600);
        await closePopup(page);

        await product.locator('.addtocart-loop').click({ force: true });

        // Lấy tên + giá ngay khi popup mở
        await page.waitForSelector('.info-column h2, .product-title h1', { timeout: 10000 });
        const productName = await page.locator('.info-column h2, .product-title h1')
            .first().innerText();
        const price = await page.locator('.price-detail span').first().innerText();

        await closePopup(page);

        //7. Chọn màu và size mong muốn.
        // Chọn màu
        const colorLabel = page.locator('.item-option.item-option-color .list-option .item-variant label').first();
        await colorLabel.click();
        await page.waitForTimeout(200); // chờ popup update
        const color = await colorLabel.locator('span.tooltip-color').innerText();

        // Chọn size
        const sizeLabel = page.locator('.item-option.normal-item .list-option .item-variant label').first();
        await sizeLabel.click();
        await page.waitForTimeout(200); // chờ popup update
        const sizeText = await sizeLabel.locator('span').first().innerText();

        // 7. Nhập số lượng = 1.
        await page.locator('input[name="quantity"], input.input-quantity').first().fill('1');

        //8. Nhấn "Thêm vào giỏ hàng".
        await page.click('button.addtocart-detail-qv:has-text("Thêm vào giỏ hàng")');
        await page.waitForTimeout(10000);

        //9. Kiểm tra thông báo.
        // Vào giỏ để kiểm tra
        const cartItem = page.locator('.item-cart').first();

        const nameInCart = await cartItem.locator('.title-info, .product-name a').first().innerText();
        expect(nameInCart.trim()).toContain(productName.trim());

        const variantLocator = cartItem.locator('span.name-variant').first();
        const variant = await variantLocator.innerText();
        const colorInCart = variant.split('/')[0].trim();
        const sizeInCart = variant.split('/')[1].trim();

        expect(colorInCart).toBe(color);
        expect(sizeInCart).toBe(sizeText);

        await expect(cartItem.locator('.price-sell')).toHaveText(price.trim());
        await expect(cartItem.locator('input[name="quantity"], input.input-quantity')).toHaveValue('1');

        const finalCount = await getCartCount(page);
        expect(finalCount).toBe(initialCount + 1);
        console.log(`✓ PASS: Thông tin sản phẩm trong giỏ đúng hoàn toàn`);
    });

    test('[Cart_MGT_ADD_06] Kiểm tra thêm sản phẩm từ trang chi tiết', async ({ page }) => {
        await closePopup(page);
        //5. Chọn sản phẩm đầu tiên: click để vào trang chi tiết.
        const product = page.locator('.product-loop').first().click();
        await page.waitForTimeout(600);

        // 6.Chọn màu 
        const colorLabel = page.locator('.item-option.item-option-color .list-option .item-variant label').first();
        await colorLabel.click();
        await page.waitForTimeout(200); // chờ popup update
        console.log('✓ Chọn màu');

        // 6.Chọn size
        const sizeLabel = page.locator('.item-option.normal-item .list-option .item-variant label').first();
        await sizeLabel.click();
        await page.waitForTimeout(200); // chờ popup update
        console.log('✓ Chọn size');

        // 7.Nhập số lượng
        const qtyInput = page.locator('input[type="number"], input.input-quantity, input[name="quantity"]').first();
        await qtyInput.waitFor({ state: 'visible', timeout: 5000 });
        await qtyInput.fill('1');
        await page.waitForTimeout(500);
        console.log('✓ Nhập số lượng: 1');

        //8. Nhấn "Thêm vào giỏ hàng".
        await page.click('button.addtocart-detail:has-text("Thêm vào giỏ hàng")');
        //9. Kiểm tra thông báo.
        const msg = await getSuccessMessage(page);
        expect(msg).toContain('Đã thêm vào giỏ hàng');
        console.log(`✓ PASS: Thêm thành công sản phẩm từ trang chi tiết`);
    });

    test('[Cart_MGT_ADD_07] Thêm sản phẩm khi chưa đăng nhập (guest)', async ({ page }) => {

        //5. Truy cập vào trang thông tin cá nhân.  
        await page.goto('https://rabity.vn/account');
        await page.waitForTimeout(600);
        //7. Truy cập trang danh sách sản phẩm theo danh mục. 
        await page.click('a:has-text("Đăng xuất")');
        await page.waitForTimeout(600);

        //7. Truy cập trang danh sách sản phẩm theo danh mục. 
        await page.goto('https://rabity.vn/collections/giay-tre-em');
        await expect(page.locator('.product-loop').first()).toBeVisible({ timeout: 10000 });
        await closePopup(page);
        //8. Chọn sản phẩm đầu tiên: click để vào trang chi tiết.
        page.locator('.product-loop').first().click();
        await page.waitForTimeout(600);
        await closePopup(page);

        // 9.Chọn màu
        const colorLabel = page.locator('.item-option.item-option-color .list-option .item-variant label').first();
        await colorLabel.click();
        await page.waitForTimeout(200); // chờ popup update
        console.log('✓ Chọn màu');

        //9.Chọn size
        const sizeLabel = page.locator('.item-option.normal-item .list-option .item-variant label').first();
        await sizeLabel.click();
        await page.waitForTimeout(200); // chờ popup update
        console.log('✓ Chọn size');

        // 10. Nhập số lượng = 1.
        const qtyInput = page.locator('input[type="number"], input.input-quantity, input[name="quantity"]').first();
        await qtyInput.waitFor({ state: 'visible', timeout: 5000 });
        await qtyInput.fill('1');
        await page.waitForTimeout(500);
        console.log('✓ Nhập số lượng: 1');


        //11. Nhấn “Thêm vào giỏ hàng”.
        await page.click('button.addtocart-detail:has-text("Thêm vào giỏ hàng")');
        //12. Kiểm tra thông báo.
        const msg = await getSuccessMessage(page);
        expect(msg).toContain('Đã thêm vào giỏ hàng');
        console.log(`✓ PASS: Thêm thành công sản phẩm từ trang chi tiết`);
    });

});