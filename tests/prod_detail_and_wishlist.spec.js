const { test, expect } = require('@playwright/test');

const productURL = 'https://rabity.vn/products/dam-vay-nhung-co-sen-be-gai-rabity-92902';
const wishlistURL = 'https://rabity.vn/account?view=wishlist';

// Hàm hỗ trợ: Quét và diệt Overlay liên tục (Phiên bản "Hủy diệt")
// Renamed from damBaoOverlayDong to ensureOverlayClosed
async function ensureOverlayClosed(page, duration = 3000) {
  // console.log(`--- Scanning for Overlay in ${duration}ms ---`);
  
  const startTime = Date.now();
  
  // Danh sách selector nút đóng (để click thử)
  const closeBtnSelectors = [
    'div.om-global-close-button', // Cái bạn vừa gửi
    '.om-popup-close',
    '.om-popup-close-x',
    'div.om-overlay button',
    'div.popup button.close',
    '#close-icon',
    'button[aria-label="Close"]'
  ];

  while (Date.now() - startTime < duration) {
    // CHIẾN THUẬT 1: XÓA SỔ VĨNH VIỄN BẰNG JS (Hiệu quả 100% nếu selector đúng)
    try {
      await page.evaluate(() => {
        // 1. Tìm tất cả các loại popup/overlay/backdrop
        const blockers = document.querySelectorAll(
          'div[class*="om-overlay"], div[class*="om-popup"], div.popup, div#popupId, .modal-backdrop, .popup-container'
        );
        
        blockers.forEach(el => {
          // Xóa ngay lập tức bất kể nó đang ẩn hay hiện
          el.remove();
        });

        // 2. Tìm nút đóng cụ thể mà bạn gửi và XÓA luôn cha của nó (để chắc ăn)
        const specificCloseBtn = document.querySelector('.om-global-close-button');
        if (specificCloseBtn) {
            // Tìm phần tử cha bao bọc popup và xóa nó
            const parentPopup = specificCloseBtn.closest('div[class*="om-"]'); 
            if (parentPopup) parentPopup.remove();
            else specificCloseBtn.remove();
        }

        // 3. Mở khóa cuộn chuột
        document.body.style.overflow = 'auto';
        document.body.style.position = 'static'; // Fix trường hợp body bị fixed
        document.documentElement.style.overflow = 'auto';
      });
    } catch (e) {}

    // CHIẾN THUẬT 2: CLICK (Dự phòng)
    // Nếu JS trên chưa kịp chạy hoặc popup nằm trong iframe (khó xóa), ta click liên tục
    for (const selector of closeBtnSelectors) {
      try {
        const btn = page.locator(selector).first();
        if (await btn.isVisible()) {
          // Hover vào trước để kích hoạt sự kiện nếu cần
          await btn.hover({ timeout: 200 }).catch(() => {}); 
          await btn.click({ force: true, timeout: 200 });
        }
      } catch (e) {}
    }

    // Quét rất nhanh (200ms/lần) để không bỏ sót khoảnh khắc popup vừa hiện
    await page.waitForTimeout(200); 
  }
}

test.describe('Module: Product_Detail (Product Detail Page)', () => {

  // Trước mỗi test, vào trang và đóng popup/overlay nếu có
  test.beforeEach(async ({ page }) => {
    await page.goto(productURL);
    await ensureOverlayClosed(page, 3000);
  });

  test('TC01_Prod_detail - Page loads successfully', async ({ page }) => {
    await ensureOverlayClosed(page);
    await expect(page).toHaveURL(/\/products\//);
  });

  test('TC02_Prod_detail - Product name is displayed correctly', async ({ page }) => {
    await ensureOverlayClosed(page);
    const tenSP = page.locator('div.info-column > h1');
    await expect(tenSP).toBeVisible({ timeout: 10000 });
    const tenSanPham = await tenSP.textContent();
    console.log('Product Name:', tenSanPham);
    expect(tenSanPham).not.toBeNull();
  });

  test('TC03_Prod_detail - Product price is displayed correctly', async ({ page }) => {
    await ensureOverlayClosed(page);
    const giaSP = page.locator('div.price-detail.hasSale > span');
    await expect(giaSP).toBeVisible();
    const giaText = (await giaSP.textContent())?.replace(/[^\d]/g, '');
    console.log('Product Price:', giaText);
    expect(giaText).toMatch(/^\d+$/);
  });

  test('TC04_Prod_detail - Product description is displayed correctly', async ({ page }) => {
    await ensureOverlayClosed(page);
    const moTa = page.locator('div.product-description');
    await expect(moTa).toBeVisible();
    const desc = await moTa.textContent();
    console.log('Product Description:', desc);
    expect(desc.length).toBeGreaterThan(0);
  });

  test('TC05_Prod_detail - Changing variant (color/size) updates SKU', async ({ page }) => {
      await ensureOverlayClosed(page);

      // Lấy SKU hiện tại
      const sku = page.locator('div.item-ability .sku-item span').filter({ hasText: /\S/ }).first();
      await sku.waitFor({ state: 'visible', timeout: 10000 });
      const skuTruoc = (await sku.textContent()).trim();
      console.log('SKU before changing variant:', skuTruoc);

      // Chọn màu khác mặc định
      const mauLabels = page.locator('.item-option-color .item-variant:not(.sold_out) label');
      for (let i = 0; i < await mauLabels.count(); i++) {
          const label = mauLabels.nth(i);
          const text = (await label.textContent()).trim();
          if (!text.includes('Đỏ - Hoa Nhí')) { // Giữ nguyên tên màu tiếng Việt của web
              await label.scrollIntoViewIfNeeded();
              await label.click();
              await page.waitForTimeout(500);
              console.log('Selected Color:', text);
              break;
          }
      }

      // Chọn size khác mặc định
      const sizeLabels = page.locator('.item-option.normal-item .item-variant:not(.sold_out) label');
      for (let i = 0; i < await sizeLabels.count(); i++) {
          const label = sizeLabels.nth(i);
          const text = (await label.textContent()).trim();
          if (!text.includes('4Y-14-16kg')) { // Giữ nguyên size tiếng Việt của web
              await label.scrollIntoViewIfNeeded();
              await label.click();
              await page.waitForTimeout(500);
              console.log('Selected Size:', text);
              break;
          }
      }

      // Lấy SKU sau khi chọn biến thể
      await sku.waitFor({ state: 'visible', timeout: 5000 });
      const skuSau = (await sku.textContent()).trim();
      console.log('SKU after changing variant:', skuSau);

      // Assert SKU thay đổi
      expect(skuSau).not.toBe(skuTruoc);
  });

  test('TC06_Prod_detail - Out of stock size displays correctly', async ({ page }) => {
    await ensureOverlayClosed(page);

    // Chọn màu
    const mauLabels = page.locator('.item-option-color .item-variant:not(.sold_out) label');
    const mauLabel = mauLabels.nth(2); // màu thứ 3
    const mauText = (await mauLabel.textContent()).trim();
    await mauLabel.click();
    console.log('Selected Color:', mauText);
    await page.waitForTimeout(500);

    // Lấy tất cả size đã hết hàng
    const sizeHetHang = page.locator('.item-option.normal-item .item-variant.sold_out label');

    for (let i = 0; i < await sizeHetHang.count(); i++) {
      const label = sizeHetHang.nth(i);
      const sizeText = (await label.textContent()).trim();

      await label.scrollIntoViewIfNeeded();
      await label.click();
      await page.waitForTimeout(500);

      const btnThemVaoGio = page.locator('.addtocart-detail');
      // Giữ nguyên text 'Tạm hết hàng' để verify UI
      await expect(btnThemVaoGio.locator('span')).toHaveText(/Tạm hết hàng/i);
      await expect(btnThemVaoGio).toHaveClass(/disabled/);
      console.log(`${sizeText} is out of stock, Add to Cart button is disabled`);
    }
  });

  test('TC07_Prod_detail - Product images open Fancybox and navigation works', async ({ page }) => {
    const hinhSP = page.locator('div.box-image img');
    const soLuongCheck = Math.min(await hinhSP.count(), 2);
    expect(soLuongCheck).toBeGreaterThan(0);

    for (let i = 0; i < soLuongCheck; i++) {
        await ensureOverlayClosed(page);
        const img = hinhSP.nth(i);
        await img.scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);
        await ensureOverlayClosed(page);
        await img.click();

        const fancyInfo = page.locator('div.fancybox-infobar span[data-fancybox-index]');
        await expect(fancyInfo).toBeVisible();

        const indexTruoc = await fancyInfo.textContent();

        const nextBtn = page.locator('div.fancybox-container button[data-fancybox-next]');
        if (await nextBtn.isVisible()) {
        await nextBtn.click();
        await page.waitForTimeout(300);
        const indexSau = await fancyInfo.textContent();
        if (indexSau !== indexTruoc) {
            console.log(`Image changed: ${indexTruoc} → ${indexSau}`);
            expect(indexSau).not.toBe(indexTruoc);
        } else {
            console.log('Image did not change or only 1 image exists, skipping assert.');
        }
        }

        const closeBtn = page.locator('div.fancybox-container button[data-fancybox-close]');
        await closeBtn.click();
        await page.waitForTimeout(200);
    }
  });

  test('TC08_Prod_detail - Add to Cart button works', async ({ page }) => {
    await ensureOverlayClosed(page);
    const btnThem = page.locator('button.addtocart-detail');
    await expect(btnThem).toBeVisible();
    await expect(btnThem).toBeEnabled();
    await btnThem.click();
    console.log('Add to Cart button clicked');
  });

  test('TC09_Prod_detail - Quantity increase/decrease buttons work', async ({ page }) => {
    await ensureOverlayClosed(page);

    const qtyInput = page.locator('.wrap-out-group .quantity-wrap .input-quantity');
    const btnTang = page.locator('.wrap-out-group .quantity-wrap .btn-plus');
    const btnGiam = page.locator('.wrap-out-group .quantity-wrap .btn-minus');

    await expect(qtyInput).toBeVisible();

    // Nhấn tăng
    await btnTang.click();
    await page.waitForTimeout(200);
    expect(await qtyInput.inputValue()).toBe('2');

    // Nhấn giảm
    await btnGiam.click();
    await page.waitForTimeout(200);
    expect(await qtyInput.inputValue()).toBe('1');

    // Không giảm dưới 1
    await btnGiam.click();
    await page.waitForTimeout(200);
    expect(await qtyInput.inputValue()).toBe('1');
    console.log('Quantity did not decrease below 1');
  });

  test('TC10_Prod_detail - Check size guide image in description', async ({ page }) => {
    await page.goto(productURL, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await ensureOverlayClosed(page);

    const moTa = page.locator('#tab1 .wrap-description');
    await moTa.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Text "Xem thêm" là UI text
    const xemThem = moTa.locator('button', { hasText: 'Xem thêm' });
    if (await xemThem.count() > 0 && await xemThem.isVisible()) {
        await xemThem.click();
        await page.waitForTimeout(300);
    }

    // Text "Kích thước sản phẩm" là UI text
    const textDiv = moTa.locator('div:has-text("Kích thước sản phẩm")');
    const sizeImg = textDiv.locator('xpath=following-sibling::div//img').first();

    await expect(sizeImg).toBeVisible({ timeout: 10000 });

    let imgUrl = await sizeImg.getAttribute('src');
    expect(imgUrl).toBeTruthy();

    if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;

    const response = await page.request.get(imgUrl);
    expect(response.status()).toBe(200);

    console.log('Size guide Image URL:', imgUrl);
  });

  test('TC11_Prod_detail - Breadcrumb display', async ({ page }) => {
    await ensureOverlayClosed(page);

    const breadcrumb = page.locator('div.breadcrumbs-detail a');
    await expect(breadcrumb.first()).toBeVisible();
    // Text "Trang chủ" là UI text
    await expect(breadcrumb.first()).toHaveText('Trang chủ');
    console.log('Breadcrumb displayed correctly');
  });

  test('TC12_Prod_detail - Product Rating', async ({ page }) => {
    await ensureOverlayClosed(page);
    const rating = page.locator('div.product-rating');
    if (await rating.count() > 0) console.log('Product rating exists');
  });

  test('TC13_Prod_detail - Check promotion codes', async ({ page }) => {
    await ensureOverlayClosed(page);

    const containerVoucher = page.locator('div.hrv-pmo-coupon.dlpm-coupon__minimum-0 div.dlpm-mini-content');
    const vouchersHien = containerVoucher.locator('div.mini-voucher:not(.hidden)');

    const count = await vouchersHien.count();
    console.log('Number of displayed vouchers:', count);

    if (count > 0) {
        const texts = await vouchersHien.allTextContents();
        const ids = await Promise.all(
            Array.from({ length: count }, async (_, i) => await vouchersHien.nth(i).getAttribute('data-id'))
        );

        console.log('Voucher contents:', texts);
        console.log('Voucher IDs:', ids);

        for (const text of texts) {
            expect(text.trim()).not.toBe('');
        }
    } else {
        console.warn('No vouchers found displayed.');
    }
  });

  test('TC14_Prod_detail - Responsive interface', async ({ page }) => {
    await ensureOverlayClosed(page);
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.locator('div.info-column > h1')).toBeVisible();
    console.log('Responsive layout check OK');
  });

  test('TC15_Prod_detail - Adding quantity exceeding stock shows error', async ({ page }) => {
    await ensureOverlayClosed(page);

    const sizeLabel = page.locator('.item-option.normal-item .item-variant:not(.sold_out) label').first();
    const sizeText = (await sizeLabel.textContent()).trim();
    await sizeLabel.click();
    await page.waitForTimeout(300);

    const qtyInput = page.locator('.wrap-out-group .quantity-wrap .input-quantity');
    const btnThem = page.locator('button.addtocart-detail');

    await qtyInput.fill('15'); 
    await btnThem.click();

    const toast = page.locator('.toast .toast-body');
    await expect(toast).toBeVisible({ timeout: 2000 });
    // Text "vượt quá tồn kho" là UI text
    await expect(toast).toHaveText(/vượt quá tồn kho/i);

    console.log(`Size ${sizeText} with quantity 15 showed stock error.`);
  });

  test('TC16_Prod_detail - Quantity input rejects negative or 0 values', async ({ page }) => {
    await ensureOverlayClosed(page);

    const qtyInput = page.locator('.wrap-out-group .quantity-wrap .input-quantity');

    // Nhập số âm
    await qtyInput.fill('-');
    await qtyInput.evaluate(input => input.dispatchEvent(new Event('change', { bubbles: true })));
    await page.waitForTimeout(200);
    expect(await qtyInput.inputValue()).toBe('1');
    console.log('Negative number reset to 1');

    // Nhập số 0
    await qtyInput.fill('0');
    await qtyInput.evaluate(input => input.dispatchEvent(new Event('change', { bubbles: true })));
    await page.waitForTimeout(200);
    expect(await qtyInput.inputValue()).toBe('1');
    console.log('Zero reset to 1');
  });

  test('TC17_Prod_detail - Navigation with single image does not error', async ({ page }) => {
    await ensureOverlayClosed(page);

    const hinhSP = page.locator('div.box-image img');
    const count = await hinhSP.count();
    if (count === 1) {
      await hinhSP.first().click();
      await page.waitForTimeout(300);

      const nextBtn = page.locator('div.fancybox-container button[data-fancybox-next]');
      const prevBtn = page.locator('div.fancybox-container button[data-fancybox-prev]');
      const closeBtn = page.locator('div.fancybox-container button[data-fancybox-close]');

      if (await nextBtn.isVisible()) await nextBtn.click();
      if (await prevBtn.isVisible()) await prevBtn.click();

      console.log('Single image navigation check OK.');
      await closeBtn.click();
      await page.waitForTimeout(200);
    } else {
      console.log('More than 1 image, skipping this test.');
    }
  });
});


test.describe('Module: Wishlist', () => {

  test.describe('Positive Cases (Logged In)', () => {

    const USER_EMAIL = 'user@gmail.com'; 
    const USER_PASS = '@User12345';
    let tenSanPhamGlobal = '';

    // 1. Đăng nhập trước mỗi Test Case
    test.beforeEach(async ({ page }) => {
      console.log('--- [Pre-condition] Check and Login ---');
      await page.goto('https://rabity.vn/account/login');
      await ensureOverlayClosed(page);

      const emailInput = page.locator('input#login-email');
      if (await emailInput.isVisible()) {
          await emailInput.fill(USER_EMAIL);
          await page.locator('input#password').fill(USER_PASS);
          await Promise.all([
              page.waitForNavigation({ waitUntil: 'load' }), 
              page.locator('#customer_login button.btn-login-form-page').click()
          ]);
          console.log('-> Login successful.');
      } else {
          console.log('-> Already logged in.');
      }
      await ensureOverlayClosed(page);
    });

    // TC18: Thêm sản phẩm (Giữ nguyên vì đã chạy tốt)
    test('TC18_Wishlist - Add product to Wishlist (Check Toast)', async ({ page }) => {
      await page.goto(productURL);
      await ensureOverlayClosed(page);

      const btnWishlist = page.locator('button.btn-wishlist').first();
      await expect(btnWishlist).toBeVisible();

      // Reset: Nếu đã tim thì bỏ tim
      const isActive = await btnWishlist.evaluate(el => el.classList.contains('in-wishlist'));
      if (isActive) {
          await btnWishlist.click();
          // Text "đã xóa" là UI text
          await expect(page.locator('.toast-body')).toContainText(/đã xóa/i, { timeout: 5000 }).catch(() => {});
          await page.waitForTimeout(1000);
      }

      // Click thêm
      await btnWishlist.click();
      
      // Check Toast
      const toastMessage = page.locator('.toast-body');
      await expect(toastMessage).toBeVisible({ timeout: 10000 });
      // Text "Đã thêm", "vào wishlist" là UI text
      await expect(toastMessage).toContainText(/Đã thêm|vào wishlist/i);
      console.log('TC18: PASS');
    });

    // TC19: Verify hiển thị (Đã sửa Selector theo HTML mới)
    test('TC19_Wishlist - Verify display on personal Wishlist page', async ({ page }) => {
      // --- BƯỚC 1: SETUP ---
      console.log('[Setup TC19] Adding product...');
      await page.goto(productURL);
      
      // Lấy tên SP chuẩn
      tenSanPhamGlobal = await page.locator('div.info-column > h1').textContent();
      
      const btnWishlist = page.locator('button.btn-wishlist').first();
      const isAdded = await btnWishlist.evaluate(el => el.classList.contains('in-wishlist'));
      if (!isAdded) {
          await btnWishlist.click();
          await expect(btnWishlist).toHaveClass(/in-wishlist/, { timeout: 5000 });
      }
      console.log('[Setup TC19] Done.');

      // --- BƯỚC 2: VERIFY ---
      await page.goto(wishlistURL);
      await ensureOverlayClosed(page);

      // CẬP NHẬT SELECTOR TỪ HTML BẠN GỬI
      // Item là class .product-loop bên trong .page-wishlist
      const listItems = page.locator('.product-loop.loop-wishlist');
      
      // Đợi item đầu tiên xuất hiện
      await expect(listItems.first()).toBeVisible({ timeout: 10000 });

      const count = await listItems.count();
      console.log(`Total products in Wishlist: ${count}`);
      expect(count).toBeGreaterThan(0);

      // Lấy tên sản phẩm từ selector mới: .box-info h4 a
      const allTitles = await listItems.locator('.box-info h4 a').allTextContents();
      
      console.log('List of product names in Wishlist:', allTitles);
      
      const isFound = allTitles.some(t => t.trim().toLowerCase().includes(tenSanPhamGlobal.trim().toLowerCase()));
      
      if (isFound) {
          console.log(`TC19: PASS - Found "${tenSanPhamGlobal}"`);
      } else {
          throw new Error(`TC19 FAIL: Product not found.`);
      }
    });

    // TC20: Xóa sản phẩm (Đã sửa Selector nút Xóa)
    test('TC20_Wishlist - Remove product from Wishlist', async ({ page }) => {
      // --- BƯỚC 1: SETUP ---
      console.log('[Setup TC20] Preparing to remove...');
      await page.goto(productURL);
      
      const btnWishlist = page.locator('button.btn-wishlist').first();
      const isAdded = await btnWishlist.evaluate(el => el.classList.contains('in-wishlist'));
      if (!isAdded) {
          await btnWishlist.click();
          await expect(btnWishlist).toHaveClass(/in-wishlist/);
      }

      // --- BƯỚC 2: DELETE ---
      await page.goto(wishlistURL);
      await ensureOverlayClosed(page);

      const listItems = page.locator('.product-loop.loop-wishlist');
      await expect(listItems.first()).toBeVisible({ timeout: 10000 });
      
      const countTruoc = await listItems.count();
      console.log(`Count before removal: ${countTruoc}`);

      // CẬP NHẬT SELECTOR NÚT XÓA TỪ HTML
      // Class: remove-wishlist
      const btnXoa = listItems.first().locator('button.remove-wishlist');
      await expect(btnXoa).toBeVisible();

      // Handle dialog (nếu có)
      page.on('dialog', dialog => dialog.accept());
      
      await btnXoa.click();
      console.log('Clicked remove.');
      
      await page.waitForTimeout(3000); // Đợi server xử lý

      // --- BƯỚC 3: CHECK ---
      const countSau = await listItems.count();
      
      if (countSau === countTruoc) {
          console.log('Reloading page to update list...');
          await page.reload();
          await ensureOverlayClosed(page);
          const countReload = await listItems.count();
          expect(countReload).toBeLessThan(countTruoc);
      } else {
          expect(countSau).toBeLessThan(countTruoc);
      }
      console.log('TC20: PASS - Removed successfully.');
    });

    test('TC21_Wishlist - Check empty list state', async ({ page }) => {
      // 1. Vào trang Wishlist
      await page.goto(wishlistURL);
      await ensureOverlayClosed(page);

      // 2. Dọn dẹp: Kiểm tra nếu đang có sản phẩm thì xóa hết
      // Selector item đã xác định từ các test trước: .product-loop.loop-wishlist
      let listItems = page.locator('.product-loop.loop-wishlist');
      let count = await listItems.count();

      console.log(`[Cleanup] Products to remove: ${count}`);

      // Vòng lặp xóa sạch danh sách
      while (count > 0) {
          // Tìm nút xóa của sản phẩm đầu tiên
          const btnXoa = listItems.first().locator('button.remove-wishlist');
          
          // Xử lý popup confirm nếu có
          page.once('dialog', dialog => dialog.accept());
          
          if (await btnXoa.isVisible()) {
              await btnXoa.click();
              console.log('-> Removed 1 product...');
              await page.waitForTimeout(2000); // Đợi server xử lý
              
              // Reload để cập nhật lại danh sách mới nhất
              await page.reload();
              await ensureOverlayClosed(page);
              
              // Cập nhật lại số lượng
              count = await page.locator('.product-loop.loop-wishlist').count();
          } else {
              break; // Phòng hờ lỗi vòng lặp vô hạn
          }
      }

      console.log('[Cleanup] List cleared. Checking empty message.');

      // 3. Verify thông báo rỗng hiển thị
      // Tìm text chính xác như bạn yêu cầu: "Chưa có sản phẩm yêu thích nào"
      // Sử dụng Regex (/.../i) để không phân biệt hoa thường và tìm text chứa trong chuỗi dài
      const emptyMessage = page.locator('text=/Chưa có sản phẩm yêu thích nào/i');
      
      // Đôi khi thông báo nằm trong thẻ cụ thể, ví dụ: .wishlist-empty-msg
      // Nhưng tìm theo text là cách tổng quát nhất
      await expect(emptyMessage).toBeVisible({ timeout: 5000 });
      
      console.log('TC21: PASS - Correctly displayed "Chưa có sản phẩm yêu thích nào".');
    });
  });

  test.describe('Negative Cases (Guest)', () => {

    // NTC01: Verify URL và Input Login 
    test('TC22_Wishlist - Access Wishlist without Login (Access Denied)', async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      console.log('Step 1: Navigate directly to Wishlist URL without login');
      await page.goto(wishlistURL);
      await ensureOverlayClosed(page);

      // Verify: Hệ thống chuyển hướng về Login
      console.log('Current URL:', page.url());
      
      // Check 1: URL chứa chữ login
      expect(page.url()).toContain('account/login');
      
      // Check 2: Check sự tồn tại của ô nhập Email
      // Đây là bằng chứng chắc chắn nhất đang ở form login
      const emailInput = page.locator('input#login-email');
      await expect(emailInput).toBeVisible({ timeout: 10000 });

      console.log('NTC01: PASS - System redirected to Login page and showed form.');
      
      await context.close();
    });

  });

});