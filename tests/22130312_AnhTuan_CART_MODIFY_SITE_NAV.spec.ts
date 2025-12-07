import { test, expect } from '@playwright/test';

// Set global timeout to 2 minutes
test.setTimeout(120000);

// =============================================================================
// PHẦN 1: TESTS QUẢN LÝ GIỎ HÀNG (CART MANAGEMENT)
// =============================================================================

// --- [CART 01] Tăng số lượng sản phẩm ---
test.describe('Kiểm tra chức năng giỏ hàng - Tăng số lượng (CART_01)', () => {

  test.beforeEach(async ({ page }) => {
    // 1. Vào trang danh sách sản phẩm
    await page.goto('https://rabity.vn/collections/all', { waitUntil: 'domcontentloaded' });

    // 2. Click vào đúng sản phẩm
    const specificProduct = page.locator('a[href*="/products/quan-dai-jean-be-gai-rabity-941-27"]').first();
    await specificProduct.waitFor();
    await specificProduct.click();

    // 3. Xử lý tại trang chi tiết sản phẩm
    await page.waitForLoadState('domcontentloaded');

    // -- QUAN TRỌNG: Chọn Size trước --
    const sizeOption = page.locator('.swatch-element:not(.soldout)').first();
    if (await sizeOption.isVisible()) {
        await sizeOption.click();
    }

    // 4. Click nút "Thêm vào giỏ hàng"
    const addToCartBtn = page.locator('.addtocart-detail').first();
    await addToCartBtn.waitFor({ state: 'visible' });
    await addToCartBtn.click();

    await page.waitForTimeout(3000);
  });

  test('Tăng số lượng sản phẩm từ 1 lên 2 trong trang Cart', async ({ page }) => {
    // 1. Vào trang giỏ hàng
    await page.goto('https://rabity.vn/cart', { waitUntil: 'domcontentloaded' });

    const cartItem = page.locator('.item-cart').first();
    const quantityInput = cartItem.locator('input.input-quantity');
    const plusBtn = cartItem.locator('button.btn-plus');

    await expect(cartItem).toBeVisible();

    // 2. Kiểm tra số lượng ban đầu là 1
    await expect(quantityInput).toHaveValue('1');

    // 3. Click nút cộng (+)
    await plusBtn.click();

    // 4. Kiểm tra kết quả: Số lượng phải lên 2
    await expect(quantityInput).toHaveValue('2');
  });
});

// --- [CART 02] Giảm số lượng sản phẩm ---
test.describe('Test Giảm số lượng sản phẩm Rabity (CART_02)', () => {

  test.beforeEach(async ({ page }) => {
    // --- BƯỚC CHUẨN BỊ: THÊM VÀO GIỎ ---
    await page.goto('https://rabity.vn/collections/all', { waitUntil: 'domcontentloaded' });
    const specificProduct = page.locator('a[href*="/products/quan-dai-jean-be-gai-rabity-941-27"]').first();
    await specificProduct.waitFor();
    await specificProduct.click();
    await page.waitForLoadState('domcontentloaded');
    const sizeOption = page.locator('.swatch-element:not(.soldout)').first();
    if (await sizeOption.isVisible()) {
        await sizeOption.click();
    }
    const addToCartBtn = page.locator('.addtocart-detail').first();
    await addToCartBtn.waitFor({ state: 'visible' });
    await addToCartBtn.click();
    await page.waitForTimeout(3000);
  });

  test('Giảm số lượng từ 2 xuống 1 bằng nút trừ (-)', async ({ page }) => {
    // 1. Vào trang giỏ hàng
    await page.goto('https://rabity.vn/cart', { waitUntil: 'domcontentloaded' });

    const cartItem = page.locator('.item-cart').first();
    const quantityInput = cartItem.locator('input.input-quantity');
    const plusBtn = cartItem.locator('button.btn-plus');
    const minusBtn = cartItem.locator('button.btn-minus');

    // --- PHẦN 1: TĂNG LÊN 2 TRƯỚC ---
    await expect(quantityInput).toHaveValue('1');
    await plusBtn.click();
    await expect(quantityInput).toHaveValue('2');

    // --- PHẦN 2: TEST GIẢM SỐ LƯỢNG (TEST CHÍNH) ---
    await minusBtn.click();

    // --- PHẦN 3: KIỂM TRA KẾT QUẢ ---
    await expect(quantityInput).toHaveValue('1');
  });
});

// --- [CART 03] Nhập trực tiếp số lượng ---
test.describe('Test Nhập trực tiếp số lượng sản phẩm (CART_03)', () => {

  test.beforeEach(async ({ page }) => {
    // --- BƯỚC CHUẨN BỊ: THÊM VÀO GIỎ ---
    await page.goto('https://rabity.vn/collections/all', { waitUntil: 'domcontentloaded' });
    const specificProduct = page.locator('a[href*="/products/quan-dai-jean-be-gai-rabity-941-27"]').first();
    await specificProduct.waitFor();
    await specificProduct.click();
    await page.waitForLoadState('domcontentloaded');
    const sizeOption = page.locator('.swatch-element:not(.soldout)').first();
    if (await sizeOption.isVisible()) {
        await sizeOption.click();
    }
    const addToCartBtn = page.locator('.addtocart-detail').first();
    await addToCartBtn.waitFor({ state: 'visible' });
    await addToCartBtn.click();
    await page.waitForTimeout(3000);
  });

  test('Nhập số lượng 3 vào ô input và kiểm tra cập nhật giá tiền', async ({ page }) => {
    // 1. Vào trang giỏ hàng
    await page.goto('https://rabity.vn/cart', { waitUntil: 'domcontentloaded' });
    const cartItem = page.locator('.item-cart').first();
    const quantityInput = cartItem.locator('input.input-quantity');
    const unitPriceElement = cartItem.locator('.box-price .price-sell, .box-price span').first(); 
    const linePriceElement = cartItem.locator('.box-lineprice');

    await expect(quantityInput).toHaveValue('1');
    const unitPriceText = await unitPriceElement.innerText();
    const unitPrice = parseInt(unitPriceText.replace(/[^0-9]/g, ''));

    // --- BƯỚC 2: THỰC HIỆN NHẬP LIỆU (Input '3') ---
    await quantityInput.click();
    await quantityInput.fill('3');
    await quantityInput.press('Enter');

    await page.waitForTimeout(3000);

    // --- BƯỚC 3: KIỂM TRA KẾT QUẢ ---
    await expect(quantityInput).toHaveValue('3');
    const expectedLinePrice = unitPrice * 3;
    const actualLinePriceText = await linePriceElement.innerText();
    const actualLinePrice = parseInt(actualLinePriceText.replace(/[^0-9]/g, ''));

    expect(actualLinePrice).toBe(expectedLinePrice);
  });
});

// --- [CART 04] Giảm khi số lượng là 1 (Min Limit) ---
test.describe('[CART_MGT_Modify_04] Kiểm tra thao tác giảm khi số lượng là 1', () => {

  test.beforeEach(async ({ page }) => {
    // --- BƯỚC CHUẨN BỊ: THÊM VÀO GIỎ ---
    await page.goto('https://rabity.vn/collections/all', { waitUntil: 'domcontentloaded' });
    const specificProduct = page.locator('a[href*="/products/quan-dai-jean-be-gai-rabity-941-27"]').first();
    await specificProduct.waitFor();
    await specificProduct.click();
    await page.waitForLoadState('domcontentloaded');
    const sizeOption = page.locator('.swatch-element:not(.soldout)').first();
    if (await sizeOption.isVisible()) {
        await sizeOption.click();
    }
    const addToCartBtn = page.locator('.addtocart-detail').first();
    await addToCartBtn.waitFor({ state: 'visible' });
    await addToCartBtn.click();
    await page.waitForTimeout(3000);
  });

  test('Nhấn nút (-) khi số lượng đang là 1 -> Số lượng vẫn giữ là 1', async ({ page }) => {
    // 1. Vào trang giỏ hàng
    await page.goto('https://rabity.vn/cart', { waitUntil: 'domcontentloaded' });
    const cartItem = page.locator('.item-cart').first();
    const minusBtn = cartItem.locator('button.btn-minus');
    const quantityInput = cartItem.locator('input.input-quantity');

    // --- BƯỚC 1: KIỂM TRA TRẠNG THÁI ĐẦU ---
    await expect(quantityInput).toHaveValue('1');

    // --- BƯỚC 2: THỰC HIỆN HÀNH ĐỘNG ---
    await minusBtn.click();
    await page.waitForTimeout(2000);

    // --- BƯỚC 3: KIỂM TRA KẾT QUẢ ---
    await expect(quantityInput).toHaveValue('1');
  });
});

// --- [CART 05] Tăng khi Max Limit (999) ---
test.describe('[CART_MGT_Modify_05] Kiểm tra nút (+) khi đạt giới hạn Max (999)', () => {

  test.beforeEach(async ({ page }) => {
    // --- BƯỚC CHUẨN BỊ ---
    await page.goto('https://rabity.vn/collections/all', { waitUntil: 'domcontentloaded' });
    const specificProduct = page.locator('a[href*="/products/quan-dai-jean-be-gai-rabity-941-27"]').first();
    await specificProduct.waitFor();
    await specificProduct.click();
    await page.waitForLoadState('domcontentloaded');
    const sizeOption = page.locator('.swatch-element:not(.soldout)').first();
    if (await sizeOption.isVisible()) await sizeOption.click();
    const addToCartBtn = page.locator('.addtocart-detail').first();
    await addToCartBtn.waitFor({ state: 'visible' });
    await addToCartBtn.click();
    await page.waitForTimeout(3000);
  });

  test('Từ 998 -> (+) -> 999 -> (+) -> Vẫn giữ 999', async ({ page }) => {
    await page.goto('https://rabity.vn/cart', { waitUntil: 'domcontentloaded' });
    const cartItem = page.locator('.item-cart').first();
    const quantityInput = cartItem.locator('input.input-quantity');
    const plusBtn = cartItem.locator('button.btn-plus');

    // --- BƯỚC 1: TẠO ĐÀ (SET LÊN 998) ---
    await quantityInput.click();
    await quantityInput.fill('998');
    await page.locator('h1, .title-page, body').first().click();
    await page.waitForTimeout(2000);
    await expect(quantityInput).toHaveValue('998');

    // --- BƯỚC 2: NHẤN (+) LẦN 1 -> MONG ĐỢI LÊN 999 ---
    await plusBtn.click();
    await page.waitForTimeout(2000);
    await expect(quantityInput).toHaveValue('999');

    // --- BƯỚC 3: TEST CHÍNH (NHẤN + LẦN 2) ---
    await plusBtn.click();
    await page.waitForTimeout(2000);

    // --- BƯỚC 4: KIỂM TRA KẾT QUẢ ---
    await expect(quantityInput).toHaveValue('999');
  });
});

// --- [CART 06] Nhập quá Max Limit (1000) ---
test.describe('[CART_MGT_Modify_06] Kiểm tra nhập quá giới hạn (1000) bằng thao tác Click out', () => {

  test.beforeEach(async ({ page }) => {
    // --- BƯỚC CHUẨN BỊ ---
    await page.goto('https://rabity.vn/collections/all', { waitUntil: 'domcontentloaded' });
    const specificProduct = page.locator('a[href*="/products/quan-dai-jean-be-gai-rabity-941-27"]').first();
    await specificProduct.waitFor();
    await specificProduct.click();
    await page.waitForLoadState('domcontentloaded');
    const sizeOption = page.locator('.swatch-element:not(.soldout)').first();
    if (await sizeOption.isVisible()) await sizeOption.click();
    const addToCartBtn = page.locator('.addtocart-detail').first();
    await addToCartBtn.waitFor({ state: 'visible' });
    await addToCartBtn.click();
    await page.waitForTimeout(3000);
  });

  test('Nhập 1000 -> Click ra ngoài -> Số lượng tự đổi về 999', async ({ page }) => {
    await page.goto('https://rabity.vn/cart', { waitUntil: 'domcontentloaded' });
    const cartItem = page.locator('.item-cart').first();
    const quantityInput = cartItem.locator('input.input-quantity');

    // 1. Nhập 1000
    await quantityInput.click();
    await quantityInput.fill('1000');
    
    // 2. CLICK RA NGOÀI
    await page.locator('h1, .title-page, body').first().click();
    await page.waitForTimeout(3000);

    // 3. Kiểm tra: Mong đợi về 999
    await expect(quantityInput).toHaveValue('999');
  });
});

// --- [CART 07] Nhập giá trị không hợp lệ ---
test.describe('[CART_MGT_Modify_07] Kiểm tra nhập giá trị không hợp lệ (0, số âm, chữ)', () => {

  test('Kiểm tra lần lượt 3 trường hợp: Nhập 0, Nhập số âm, Nhập chữ', async ({ page }) => {
    
    // --- BƯỚC 1: SETUP (Thêm sản phẩm) ---
    await test.step('PRE-CONDITION: Thêm sản phẩm vào giỏ hàng', async () => {
        await page.goto('https://rabity.vn/collections/all', { waitUntil: 'domcontentloaded' });
        const specificProduct = page.locator('a[href*="/products/quan-dai-jean-be-gai-rabity-941-27"]').first();
        await specificProduct.waitFor();
        await specificProduct.click();
        await page.waitForLoadState('domcontentloaded');
        const sizeOption = page.locator('.swatch-element:not(.soldout)').first();
        if (await sizeOption.isVisible()) {
            await sizeOption.click();
        }
        const addToCartBtn = page.locator('.addtocart-detail').first();
        await addToCartBtn.waitFor({ state: 'visible' });
        await addToCartBtn.click();
        await page.waitForTimeout(3000);
    });

    await page.goto('https://rabity.vn/cart', { waitUntil: 'domcontentloaded' });
    const cartItem = page.locator('.item-cart').first();
    const quantityInput = cartItem.locator('input.input-quantity');

    // --- KỊCH BẢN 1: Nhập số '0' ---
    await test.step('Case 1: Nhập "0" -> Mong đợi tự sửa về 1', async () => {
        await quantityInput.click();
        await quantityInput.fill('0');
        await page.locator('h1, .title-page, body').first().click();
        await page.waitForTimeout(2000);
        await expect(quantityInput).toHaveValue('1');
    });

    // --- KỊCH BẢN 2: Nhập số âm '-5' ---
    await test.step('Case 2: Nhập số âm "-5" -> Mong đợi tự sửa về 1', async () => {
        await quantityInput.click();
        await quantityInput.fill('-5');
        await page.locator('h1, .title-page, body').first().click();
        await page.waitForTimeout(2000);
        await expect(quantityInput).toHaveValue('1');
    });

    // --- KỊCH BẢN 3: Nhập chữ 'abc' ---
    await test.step('Case 3: Nhập chữ "abc" -> Mong đợi tự sửa về 1', async () => {
        await quantityInput.fill('1'); 
        await quantityInput.click();
        await quantityInput.fill('abc');
        await page.locator('h1, .title-page, body').first().click();
        await page.waitForTimeout(2000);
        await expect(quantityInput).toHaveValue('1');
    });
  });
});

// --- [CART 08] Xóa sản phẩm (Accept) ---
test.describe('[CART_MGT_Modify_08] Kiểm tra chức năng Xóa sản phẩm', () => {

  test.beforeEach(async ({ page }) => {
    // --- BƯỚC CHUẨN BỊ: THÊM VÀO GIỎ ---
    await page.goto('https://rabity.vn/collections/all', { waitUntil: 'domcontentloaded' });
    const specificProduct = page.locator('a[href*="/products/quan-dai-jean-be-gai-rabity-941-27"]').first();
    await specificProduct.waitFor();
    await specificProduct.click();
    await page.waitForLoadState('domcontentloaded');
    const sizeOption = page.locator('.swatch-element:not(.soldout)').first();
    if (await sizeOption.isVisible()) {
        await sizeOption.click();
    }
    const addToCartBtn = page.locator('.addtocart-detail').first();
    await addToCartBtn.waitFor({ state: 'visible' });
    await addToCartBtn.click();
    await page.waitForTimeout(3000);
  });

  test('Nhấn nút Xóa -> Sản phẩm phải biến mất khỏi giỏ hàng', async ({ page }) => {
    await page.goto('https://rabity.vn/cart', { waitUntil: 'domcontentloaded' });

    // 1. Tìm nút xóa
    const deleteBtn = page.locator('a[href*="quantity=0"]').first();
    await expect(deleteBtn).toBeVisible();

    // 2. Xử lý Popup xác nhận -> ACCEPT (Đồng ý xóa)
    page.on('dialog', async dialog => {
        await dialog.accept();
    });

    // 3. Click nút xóa
    await deleteBtn.click();
    await page.waitForTimeout(3000);

    // 4. KIỂM TRA KẾT QUẢ
    const cartItems = page.locator('.item-cart');
    await expect(cartItems).toHaveCount(0); // Mong đợi không còn sản phẩm nào
  });
});

// --- [CART 09] Hủy xóa sản phẩm (Dismiss) ---
test.describe('[CART_MGT_Modify_09] Kiểm tra chức năng Hủy thao tác xóa', () => {

  test.beforeEach(async ({ page }) => {
    // --- BƯỚC CHUẨN BỊ: THÊM VÀO GIỎ ---
    await page.goto('https://rabity.vn/collections/all', { waitUntil: 'domcontentloaded' });
    const specificProduct = page.locator('a[href*="/products/quan-dai-jean-be-gai-rabity-941-27"]').first();
    await specificProduct.waitFor();
    await specificProduct.click();
    await page.waitForLoadState('domcontentloaded');
    const sizeOption = page.locator('.swatch-element:not(.soldout)').first();
    if (await sizeOption.isVisible()) {
        await sizeOption.click();
    }
    const addToCartBtn = page.locator('.addtocart-detail').first();
    await addToCartBtn.waitFor({ state: 'visible' });
    await addToCartBtn.click();
    await page.waitForTimeout(3000);
  });

  test('Nhấn Xóa -> Chọn Hủy (Cancel) -> Sản phẩm vẫn còn', async ({ page }) => {
    await page.goto('https://rabity.vn/cart', { waitUntil: 'domcontentloaded' });

    const deleteBtn = page.locator('a[href*="quantity=0"]').first();
    const cartItem = page.locator('.item-cart').first();

    await expect(cartItem).toBeVisible();

    // 1. Thiết lập xử lý Popup -> DISMISS (Hủy xóa)
    page.on('dialog', async dialog => {
        await dialog.dismiss(); 
    });

    // 2. Click nút xóa
    await deleteBtn.click();
    await page.waitForTimeout(2000);

    // 3. KIỂM TRA KẾT QUẢ
    // Mong đợi: Sản phẩm vẫn còn nằm đó
    await expect(cartItem).toBeVisible();
    
    // Kiểm tra kỹ hơn: Số lượng vẫn là 1
    await expect(cartItem.locator('input.input-quantity')).toHaveValue('1');
  });
});

// =============================================================================
// PHẦN 2: TESTS ĐIỀU HƯỚNG/GIAO DIỆN (SITE NAVIGATION)
// =============================================================================

// --- [SITE_NAV 01] Banner Quảng Cáo ---
test.describe('SITE_NAV_Banner_01: Kiểm tra Banner Quảng Cáo', () => {

  test('Click vào Banner Slider tại trang chủ và kiểm tra chuyển hướng', async ({ page }) => {
    // 1. Vào trang chủ
    await page.goto('https://rabity.vn/', { waitUntil: 'domcontentloaded' });

    // 2. Xác định Banner Slider
    const bannerLink = page.locator('.swiper-homepage-slider .swiper-slide a').first();
    await expect(bannerLink).toBeVisible();

    const expectedLink = await bannerLink.getAttribute('href');

    // 3. Click Banner
    await bannerLink.click({ force: true });

    // 4. Chờ chuyển trang
    await page.waitForLoadState('domcontentloaded');

    // 5. Kiểm tra URL thực tế
    const currentUrl = page.url();
    if (expectedLink) {
        expect(currentUrl).toContain(expectedLink);
    }
  });
});

// --- [SITE_NAV 02] Nút CTA (Thêm giỏ / Mua ngay) ---
test.describe('SITE_NAV_Body_01: Kiểm tra nút CTA (Thêm giỏ / Mua ngay) tại trang chi tiết', () => {

  test.beforeEach(async ({ page }) => {
    // 1. Vào trang danh sách sản phẩm
    await page.goto('https://rabity.vn/collections/all', { waitUntil: 'domcontentloaded' });

    // 2. Click vào sản phẩm đầu tiên để vào trang chi tiết
    const productLink = page.locator('.product-loop .box-info h4 a').first();
    await expect(productLink).toBeVisible();
    await productLink.click();

    // 3. Chờ trang chi tiết tải xong
    await page.waitForLoadState('domcontentloaded');

    // 4. Chọn Size (Bắt buộc để nút CTA hoạt động)
    const size = page.locator('.swatch-element:not(.soldout)').first();
    if (await size.isVisible()) {
        await size.click();
    }
  });

  // --- CASE 1: NÚT THÊM VÀO GIỎ ---
  test('Click nút "Thêm vào giỏ" -> Kiểm tra icon giỏ hàng cập nhật', async ({ page }) => {
    const addToCartBtn = page.locator('.addtocart-detail, button[id="add-to-cart"]').first();
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();

    // Icon giỏ hàng trên Header nảy số
    const cartCount = page.locator('.cart-header .count-item');
    await expect(cartCount).not.toHaveText('0');
    
    // URL không đổi (vẫn ở trang chi tiết)
    expect(page.url()).toContain('/products/');
  });

  // --- CASE 2: NÚT MUA NGAY ---
  test('Click nút "Mua ngay" -> Chuyển hướng đến trang Thanh toán', async ({ page }) => {
    const buyNowBtn = page.locator('.buynow-detail, button:has-text("Mua ngay")').first();
    
    if (await buyNowBtn.isVisible()) {
        await buyNowBtn.click();
        await page.waitForLoadState('domcontentloaded');

        // Kiểm tra URL: Phải chứa /checkouts hoặc /cart
        const currentUrl = page.url();
        expect(currentUrl).toMatch(/\/checkouts|\/cart/);
    } else {
        console.log('SKIP: Sản phẩm này không có nút Mua ngay.');
    }
  });
});

// --- [SITE_NAV 03] Liên kết Mạng xã hội ---
test.describe('SITE_NAV_External_01: Kiểm tra liên kết Mạng xã hội', () => {

  test('Click icon Social Media và kiểm tra URL đích', async ({ page, context }) => {
    // 1. Vào trang chủ
    await page.goto('https://rabity.vn/', { waitUntil: 'domcontentloaded' });
    const socialBlock = page.locator('.list-social');
    await socialBlock.scrollIntoViewIfNeeded();

    const socialItems = [
      { name: 'Facebook', urlPart: 'facebook.com', selector: 'a[href*="facebook.com"]' },
      { name: 'YouTube', urlPart: 'youtube.com', selector: 'a[href*="youtube.com"]' }
    ];

    for (const item of socialItems) {
      await test.step(`Click Icon: ${item.name}`, async () => {
        const socialLink = socialBlock.locator(item.selector).first();
        if (await socialLink.isVisible()) {
            const targetAttr = await socialLink.getAttribute('target');
            const isNewTab = targetAttr === '_blank';

            if (isNewTab) {
                // Mở TAB MỚI
                const pagePromise = context.waitForEvent('page');
                await socialLink.click();
                const newPage = await pagePromise;
                await newPage.waitForLoadState();
                expect(newPage.url()).toContain(item.urlPart);
                await newPage.close(); 
            } else {
                // MỞ TẠI TAB HIỆN TẠI
                await socialLink.click();
                await page.waitForURL(new RegExp(item.urlPart), { timeout: 10000 });
                
                // Phải quay lại trang chủ Rabity để test icon tiếp theo
                await page.goto('https://rabity.vn/', { waitUntil: 'domcontentloaded' });
                await page.locator('.list-social').scrollIntoViewIfNeeded();
            }
        }
      });
    }
  });
});

// --- [SITE_NAV 04] Liên kết Footer & Sitemap ---
test.describe('SITE_NAV_Footer_01: Kiểm tra liên kết Footer & Sitemap', () => {

  test('Click các link trong Footer và kiểm tra trang đích', async ({ page }) => {
    await page.goto('https://rabity.vn/', { waitUntil: 'domcontentloaded' });
    const footer = page.locator('#main-footer');
    await footer.scrollIntoViewIfNeeded();

    const footerLinks = [
      { name: 'Câu chuyện về Rabity', urlPart: 'cau-chuyen-ve-rabity' },
      { name: 'Hệ thống cửa hàng', urlPart: 'danh-sach-cua-hang' },
      { name: 'Chính sách đổi trả hàng', urlPart: 'chinh-sach-doi-hang' },
      { name: 'Hướng dẫn chọn size', urlPart: 'huong-dan-chon-size' }
    ];

    for (const item of footerLinks) {
      await test.step(`Click Footer Link: ${item.name}`, async () => {
        const link = footer.locator('.linklist-footer a').filter({ hasText: item.name }).first();
        
        await expect(link).toBeVisible();
        await link.click();
        await page.waitForLoadState('domcontentloaded');

        // Kiểm tra URL và Title
        await expect(page).toHaveURL(new RegExp(item.urlPart));
        const title = await page.title();
        expect(title).not.toContain('404'); 
        
        // Quay lại và cuộn xuống
        await page.goto('https://rabity.vn/');
        await page.locator('#main-footer').scrollIntoViewIfNeeded();
      });
    }
  });
});

// --- [SITE_NAV 05] Menu Chính (Header Navigation) ---
test.describe('SITE_NAV_Header_01: Kiểm tra Menu Chính (Header Navigation)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://rabity.vn/', { waitUntil: 'domcontentloaded' });
  });

  test('Click lần lượt các menu chính trên thanh điều hướng', async ({ page }) => {
    const menuItems = [
      { name: 'BÉ GÁI', urlPart: 'thoi-trang-be-gai' }, 
      { name: 'BÉ TRAI', urlPart: 'thoi-trang-be-trai' },
      { name: '🌟 GIÀY DÉP', urlPart: 'giay-tre-em' },
      { name: 'BỘ SƯU TẬP MỚI', urlPart: 'collections/new' },
      { name: 'THỎ CHIA SẺ', urlPart: 'blogs/news' }
    ];

    for (const item of menuItems) {
      await test.step(`Click Menu: ${item.name}`, async () => {
        const menuLink = page.locator('#menu-main .ul-lv1 > li > a').filter({ hasText: item.name }).first();
        
        await expect(menuLink).toBeVisible();
        await menuLink.click();

        await page.waitForLoadState('domcontentloaded');
        
        // Kiểm tra URL
        await expect(page).toHaveURL(new RegExp(item.urlPart));

        // Quay về trang chủ
        await page.goto('https://rabity.vn/');
      });
    }
  });
});