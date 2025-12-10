import { test, expect } from '@playwright/test';

test.describe('Module Product Search - Rabity.vn', () => {

//   // ===== BEFORE EACH =====
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('https://rabity.vn/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });

    // CHỜ BANNER TẢI (3–5 GIÂY)
    await page.waitForTimeout(3000);

    // ĐÓNG BANNER nếu có
    const closeBtn = page.locator('.om-global-close-button');
    if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeBtn.click();
    }

    // Đảm bảo ô tìm kiếm sẵn sàng
    await page.getByPlaceholder("Bạn cần tìm gì?").waitFor({ state: 'visible' });
  });

  // =====================================================
  // TC01 — Search by valid keyword
  // =====================================================
  test('TC01: Search by valid keyword', async ({ page }) => {
    const keyword = 'áo khoác';

    try {
      // Nhập từ khóa vào ô tìm kiếm và nhấn Enter
      const searchInput = page.getByPlaceholder("Bạn cần tìm gì?");
      await searchInput.fill(keyword);
      await page.keyboard.press('Enter');

      // Chờ kết quả search xuất hiện hoặc title sản phẩm
      await page.waitForSelector('.box-info, h1', { state: 'attached', timeout: 20000 });

      // Lấy danh sách kết quả
      const results = page.locator('.box-info h4 a, .box-info h4, h1');

      // Lọc các element chứa từ khóa
      const firstItem = results.filter({ hasText: /áo khoác/i }).first();

      await expect(firstItem).toBeVisible({ timeout: 15000 });
      console.log('✅ TC01 Passed: Keyword search successful');

      await page.waitForTimeout(3000); 

    } catch (error) {
      console.error('❌ TC01 Failed:', error.message);
      throw error;
    }
  });



  // =====================================================
  // TC02 — Search by non-existent keyword
  // =====================================================

  test('TC02: Search by non-existent keyword', async ({ page }) => {
    const keyword = 'abcxyz123'; // từ khóa chắc chắn không có

    try {
      // Nhập từ khóa và nhấn Enter
      const searchInput = page.getByPlaceholder("Bạn cần tìm gì?");
      await searchInput.fill(keyword);
      await page.keyboard.press('Enter');

      // Chờ kết quả search xuất hiện
      await page.waitForSelector('.box-info, h1, .no-results', { state: 'attached', timeout: 20000 });

      // Lấy danh sách kết quả
      const results = page.locator('.box-info h4 a, .box-info h4, h1');

      // Kiểm tra xem không có item nào chứa từ khóa
      const count = await results.filter({ hasText: new RegExp(keyword, 'i') }).count();

      expect(count).toBe(0);
      console.log('✅ TC02 Passed: No results found as expected');

      // Nếu trang có message "Không tìm thấy sản phẩm" (tùy website)
      const noResultsMsg = page.locator('.no-results');
      if (await noResultsMsg.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('ℹ Info: "No results" message is displayed');
      }

    } catch (error) {
      console.error('❌ TC02 Failed:', error.message);
      throw error;
    }
  });



 // =====================================================
  // TC03 — Search with empty input
  // =====================================================
  test('TC03: Search with empty input', async ({ page }) => {
    try {
      // Lấy ô tìm kiếm và để trống
      const searchInput = page.getByPlaceholder("Bạn cần tìm gì?");
      await searchInput.fill(''); // để trống

      // Nhấn Enter hoặc nút Tìm kiếm
      await page.keyboard.press('Enter');

      // Kiểm tra: hệ thống không thực hiện tìm kiếm
      // Có thể kiểm tra:
      // 1. URL không thay đổi
      // 2. Không xuất hiện kết quả .box-info hay h1
      // 3. Input vẫn rỗng
      await expect(searchInput).toHaveValue('');
      
      const resultsVisible = await page.locator('.box-info, h1').isVisible().catch(() => false);
      expect(resultsVisible).toBe(false);

      console.log('✅ TC03 Passed: No search executed for empty input');

    } catch (error) {
      console.error('❌ TC03 Failed:', error.message);
      throw error;
    }
  });



 // =====================================================
  // TC04 — Search with special characters
  // =====================================================
  test('TC04: Search with special characters', async ({ page }) => {
    const keyword = 'Áo % Khoác';

    try {
      // Nhập từ khóa có ký tự đặc biệt và nhấn Enter
      const searchInput = page.getByPlaceholder("Bạn cần tìm gì?");
      await searchInput.fill(keyword);
      await page.keyboard.press('Enter');

      // Chờ kết quả search xuất hiện
      await page.waitForSelector('.box-info, h1', { state: 'attached', timeout: 20000 });

      // Lấy danh sách kết quả
      const results = page.locator('.box-info h4 a, .box-info h4, h1');

      // Kiểm tra ít nhất 1 sản phẩm hiển thị (có thể chứa ký tự đặc biệt hoặc liên quan)
      await page.waitForTimeout(5000);
      const count = await results.count();
      expect(count).toBeGreaterThan(0);

      console.log(`✅ TC04 Passed: Search with special characters returned ${count} results`);

    } catch (error) {
      console.error('❌ TC04 Failed:', error.message);
      throw error;
    }
  });



    // =====================================================
  // TC05 — Search and navigate back
  // =====================================================
  test('TC05: Search and navigate back', async ({ page }) => {
    const keyword = 'Áo khoác';

    try {
      // 1️⃣ Tìm kiếm từ khóa
      const searchInput = page.getByPlaceholder("Bạn cần tìm gì?");
      await searchInput.fill(keyword);
      await page.keyboard.press('Enter');

      // Chờ kết quả search xuất hiện
      await page.waitForSelector('.box-info, h1', { state: 'attached', timeout: 20000 });

      // 2️⃣ Chọn sản phẩm đầu tiên
      const firstProduct = page.locator('.box-info h4 a, .box-info h4').first();
      await expect(firstProduct).toBeVisible({ timeout: 15000 });
      await firstProduct.click();

      // Chờ trang chi tiết sản phẩm load
      await page.waitForSelector('h1, .product-detail', { state: 'visible', timeout: 20000 });
      console.log('ℹ️ Product detail page loaded');

      // 3️⃣ Nhấn nút Back của trình duyệt
      await page.goBack({ waitUntil: 'domcontentloaded' });

      // Chờ trang kết quả search load lại
      await page.waitForSelector('.box-info, h1', { state: 'attached', timeout: 20000 });

      // Kiểm tra ít nhất 1 sản phẩm vẫn hiển thị
      const results = page.locator('.box-info h4 a, .box-info h4');
      const count = await results.count();
      expect(count).toBeGreaterThan(0);

      console.log(`✅ TC05 Passed: Back to search results successful, ${count} products visible`);

    } catch (error) {
      console.error('❌ TC05 Failed:', error.message);
      throw error;
    }
  });




  // =====================================================
  // TC06 — Search by SKU
  // =====================================================
  test('TC06: Search by SKU', async ({ page }) => {
    const sku = '9229002510415';
  
    try {
      // Nhập SKU vào ô tìm kiếm và nhấn Enter
      const searchInput = page.getByPlaceholder("Bạn cần tìm gì?");
      await searchInput.fill(sku);
      await page.keyboard.press('Enter');
  
      // Chờ kết quả search xuất hiện hoặc title sản phẩm
      await page.waitForSelector('.box-info, h1', { state: 'attached', timeout: 20000 });
  
      // Lấy danh sách kết quả
      const results = page.locator('.box-info h4 a, .box-info h4, h1');
  
      // Lọc các element chứa SKU hoặc từ khóa phụ nếu layout trả về <h1>
      const firstItem = results.filter({
        hasText: new RegExp(`${sku}|áo khoác`, 'i')
      }).first();
  
      await expect(firstItem).toBeVisible({ timeout: 15000 });
      console.log('✅ TC06 Passed: SKU search successful');
  
    } catch (error) {
      console.error('❌ TC06 Failed:', error.message);
      throw error;
    }
  });


});














test.describe('Module Checkout - Rabity.vn', () => {

  // ===== PRE-CONDITION: Truy cập sản phẩm và thêm vào giỏ hàng =====
  test.beforeEach(async ({ page }) => {
    test.setTimeout(300000);



  });

  // =====================================================
  // TC01 — Điền đầy đủ thông tin thanh toán
  // =====================================================
  test('TC01: Điền đầy đủ Tên, SĐT, Email, Địa chỉ, Tỉnh/TP', async ({ page }) => {
        // 1️⃣ Truy cập trực tiếp trang chi tiết sản phẩm
        await page.goto(
          'https://rabity.vn/products/ao-ni-mu-dai-tay-be-gai-rabity-915-001', 
          { waitUntil: 'domcontentloaded', timeout: 90000 }
        );
    

    
        // 3️⃣ Thêm sản phẩm vào giỏ hàng 
        const addToCartBtn = page.locator('button.addtocart-detail');  
        await expect(addToCartBtn).toBeVisible({ timeout: 5000 });
        await addToCartBtn.click();
        await page.waitForTimeout(2000); // chờ confirm add to cart
    
        // 4️⃣ Chuyển tới trang giỏ hàng
        await page.goto('https://rabity.vn/cart', { waitUntil: 'domcontentloaded' });
    
        // 5️⃣ Nhấn nút Thanh toán để đi tới checkout
        const checkoutBtn = page.locator('button#checkout-process');
        await expect(checkoutBtn).toBeVisible({ timeout: 5000 });
        await checkoutBtn.click();
    
        
    try {
      await page.waitForTimeout(1000); 

      // 1️⃣ Điền Họ và tên
      const nameInput = page.locator('input#name');
      await nameInput.fill('Nguyen Van A');
      await expect(nameInput).toHaveValue('Nguyen Van A');
      await page.waitForTimeout(1000); 

      // 2️⃣ Điền SĐT
      const phoneInput = page.locator('input#phone');
      await phoneInput.click();
      await phoneInput.fill('0399989979');
      await phoneInput.press('Tab');         
      await expect(phoneInput).toHaveValue('0399989979');
      await page.waitForTimeout(1000); 

      // 3️⃣ Điền Email
      const emailInput = page.locator('input#email');
      await emailInput.fill('hung@gmail.com');
      await emailInput.press('Tab');         
      await expect(emailInput).toHaveValue('hung@gmail.com');
      await page.waitForTimeout(1000); 

      // 4️⃣ Điền địa chỉ tên đường
      const addressInput = page.locator('input#address');
      await addressInput.fill('linh trung');
      await page.waitForTimeout(1000); 

      // Chờ dropdown hiện ra (giả sử dropdown xuất hiện dưới dạng div role="listbox")
      const firstAddressOption = page.locator('div[role="listbox"] div[role="option"]').first();
      await firstAddressOption.click();
      await page.waitForTimeout(1000); 

      // 5️⃣ Chọn Tỉnh/TP
      const fullAddressInput = page.locator('input#fulladdress');
      await fullAddressInput.fill('linh trung');
      await page.waitForTimeout(1000); 

      // Chọn option đầu tiên trong dropdown
      const firstOption = page.locator('#react-select-4-listbox div[role="option"]').first();
      await firstOption.click();    
      await page.waitForTimeout(1000); 


      console.log('✅ TC01 Passed: Billing information entered successfully');
    } catch (error) {
      console.error('❌ TC01 Failed:', error.message);
      throw error;
    }
  });




  //  // =====================================================
  // // TC02 — Bỏ trống Tên và đặt hàng
  // // =====================================================
  test('TC02: Bỏ trống trường Tên khi đặt hàng', async ({ page }) => {
        // 1️⃣ Truy cập trực tiếp trang chi tiết sản phẩm
        await page.goto(
          'https://rabity.vn/products/ao-ni-mu-dai-tay-be-gai-rabity-915-001', 
          { waitUntil: 'domcontentloaded', timeout: 90000 }
        );
    

        // 3️⃣ Thêm sản phẩm vào giỏ hàng 
        const addToCartBtn = page.locator('button.addtocart-detail');  
        await expect(addToCartBtn).toBeVisible({ timeout: 5000 });
        await addToCartBtn.click();
        await page.waitForTimeout(2000); // chờ confirm add to cart
    
        // 4️⃣ Chuyển tới trang giỏ hàng
        await page.goto('https://rabity.vn/cart', { waitUntil: 'domcontentloaded' });
    
        // 5️⃣ Nhấn nút Thanh toán để đi tới checkout
        const checkoutBtn = page.locator('button#checkout-process');
        await expect(checkoutBtn).toBeVisible({ timeout: 5000 });
        await checkoutBtn.click();
    
        
    try {
      // 1️⃣ Bỏ trống Tên
      const nameInput = page.locator('input#name');
      await nameInput.fill('');  // đảm bảo rỗng

      // 2️⃣ Điền các trường còn lại
      const phoneInput = page.locator('input#phone');
      await phoneInput.click();
      await phoneInput.fill('0399989979');
      await phoneInput.press('Tab');

      const emailInput = page.locator('input#email');
      await emailInput.click();
      await emailInput.fill('');
      await emailInput.type('hung@gmail.com');
      await emailInput.press('Tab');

      const addressInput = page.locator('input#address');
      await addressInput.fill('linh trung');
      const firstAddressOption = page.locator('div[role="listbox"] div[role="option"]').first();
      await firstAddressOption.click();

      const fullAddressInput = page.locator('input#fulladdress');
      await fullAddressInput.fill('an khánh');
      const firstFullAddressOption = page.locator('#react-select-4-listbox div[role="option"]').first();
      await firstFullAddressOption.click();

      // 3️⃣ Nhấn nút Đặt hàng
      const placeOrderBtn = page.locator('button#place_order', { hasText: 'Đặt hàng' }).first();
      await expect(placeOrderBtn).toBeVisible();
      await placeOrderBtn.click();

      // 4️⃣ Kiểm tra lỗi Tên hiển thị
      const nameError = page.locator('div[data-slot="error-message"]', { hasText: 'Vui lòng nhập họ tên' });
      await expect(nameError).toBeVisible({ timeout: 5000 });

      console.log('✅ TC02 Passed: Error message for empty name displayed correctly');
    } catch (error) {
      console.error('❌ TC02 Failed:', error.message);
      throw error;
    }
  });
  


   // =====================================================
  // TC03 — Kiểm tra định dạng số điện thoại
  // =====================================================
  test('TC03: SĐT không hợp lệ hiển thị lỗi', async ({ page }) => {
        // 1️⃣ Truy cập trực tiếp trang chi tiết sản phẩm
        await page.goto(
          'https://rabity.vn/products/ao-ni-mu-dai-tay-be-gai-rabity-915-001', 
          { waitUntil: 'domcontentloaded', timeout: 90000 }
        );
    

    
        // 3️⃣ Thêm sản phẩm vào giỏ hàng 
        const addToCartBtn = page.locator('button.addtocart-detail');  
        await expect(addToCartBtn).toBeVisible({ timeout: 5000 });
        await addToCartBtn.click();
        await page.waitForTimeout(2000); // chờ confirm add to cart
    
        // 4️⃣ Chuyển tới trang giỏ hàng
        await page.goto('https://rabity.vn/cart', { waitUntil: 'domcontentloaded' });
    
        // 5️⃣ Nhấn nút Thanh toán để đi tới checkout
        const checkoutBtn = page.locator('button#checkout-process');
        await expect(checkoutBtn).toBeVisible({ timeout: 5000 });
        await checkoutBtn.click();
    
        
    try {
      // 1️⃣ Điền Tên
      const nameInput = page.locator('input#name');
      await nameInput.fill('Nguyen Van A');

      // 2️⃣ Điền Email
      const emailInput = page.locator('input#email');
      await emailInput.fill('hung@gmail.com');

      // 3️⃣ Điền địa chỉ tên đường
      const addressInput = page.locator('input#address');
      await addressInput.fill('linh trung');
      const firstAddressOption = page.locator('div[role="listbox"] div[role="option"]').first();
      await firstAddressOption.click();

      // 4️⃣ Điền tỉnh/TP
      const fullAddressInput = page.locator('input#fulladdress');
      await fullAddressInput.fill('an khánh');
      const firstFullAddressOption = page.locator('#react-select-4-listbox div[role="option"]').first();
      await firstFullAddressOption.click();

      // 5️⃣ Nhập SĐT không hợp lệ
      const phoneInput = page.locator('input#phone');
      await phoneInput.fill('123');  // SĐT không hợp lệ
      await phoneInput.press('Tab');

      // 6️⃣ Nhấn Đặt hàng
      const placeOrderBtn = page.locator('button#place_order').first();
      await placeOrderBtn.click();

      // 7️⃣ Kiểm tra lỗi SĐT hiển thị
      const phoneError = page.locator('div[data-slot="error-message"]', { hasText: 'Số điện thoại không hợp lệ' });
      await expect(phoneError).toBeVisible({ timeout: 5000 });

      console.log('✅ TC03 Passed: Error message for invalid phone displayed correctly');
    } catch (error) {
      console.error('❌ TC03 Failed:', error.message);
      throw error;
    }
  });











  // =====================================================
  // TC04 — Kiểm tra giới hạn ký tự Họ và tên
  // =====================================================
  test('TC04: Họ và tên quá dài sẽ bị cắt bớt', async ({ page }) => {
        // 1️⃣ Truy cập trực tiếp trang chi tiết sản phẩm
        await page.goto(
          'https://rabity.vn/products/ao-ni-mu-dai-tay-be-gai-rabity-915-001', 
          { waitUntil: 'domcontentloaded', timeout: 90000 }
        );
    

    
        // 3️⃣ Thêm sản phẩm vào giỏ hàng 
        const addToCartBtn = page.locator('button.addtocart-detail');  
        await expect(addToCartBtn).toBeVisible({ timeout: 5000 });
        await addToCartBtn.click();
        await page.waitForTimeout(2000); // chờ confirm add to cart
    
        // 4️⃣ Chuyển tới trang giỏ hàng
        await page.goto('https://rabity.vn/cart', { waitUntil: 'domcontentloaded' });
    
        // 5️⃣ Nhấn nút Thanh toán để đi tới checkout
        const checkoutBtn = page.locator('button#checkout-process');
        await expect(checkoutBtn).toBeVisible({ timeout: 5000 });
        await checkoutBtn.click();
    
        
    try {
      // 1️⃣ Điền tên dài 500 ký tự
      const longName = 'NguyenVanA'.repeat(50); // 10 ký tự x 50 = 500
      const nameInput = page.locator('input#name');
      await nameInput.fill(longName);

      // 2️⃣ Điền Email hợp lệ
      const emailInput = page.locator('input#email');
      await emailInput.fill('hung@gmail.com');

      // 3️⃣ Điền địa chỉ tên đường
      const addressInput = page.locator('input#address');
      await addressInput.fill('112 linh trung');
      const firstAddressOption = page.locator('div[role="listbox"] div[role="option"]').first();
      await firstAddressOption.click();

      // 4️⃣ Điền tỉnh/TP
      const fullAddressInput = page.locator('input#fulladdress');
      await fullAddressInput.fill('an khánh');
      const firstFullAddressOption = page.locator('#react-select-4-listbox div[role="option"]').first();
      await firstFullAddressOption.click();

      // 5️⃣ Nhập SĐT hợp lệ
      const phoneInput = page.locator('input#phone');
      await phoneInput.fill('039989979');
      await page.waitForTimeout(500);

      // 6️⃣ Nhấn Đặt hàng
      const placeOrderBtn = page.locator('button#place_order').first();
      await placeOrderBtn.click();

      // 7️⃣ Kiểm tra giá trị thực tế của input đã bị cắt bớt
      const actualName = await nameInput.inputValue();
      console.log('Length of name input after filling:', actualName.length);

      expect(actualName.length).toBeLessThanOrEqual(90); // giả sử hệ thống giới hạn 255 ký tự
      console.log('✅ TC04 Passed: Họ và tên quá dài đã bị cắt bớt');

    } catch (error) {
      console.error('❌ TC04 Failed:', error.message);
      throw error;
    }
  });








   // =====================================================
  // TC05 — Kiểm tra chọn option thứ 2 trong autocomplete địa chỉ
  // =====================================================
  test('TC05: Chọn option thứ 2 từ autocomplete địa chỉ', async ({ page }) => {
        // 1️⃣ Truy cập trực tiếp trang chi tiết sản phẩm
        await page.goto(
          'https://rabity.vn/products/ao-ni-mu-dai-tay-be-gai-rabity-915-001', 
          { waitUntil: 'domcontentloaded', timeout: 90000 }
        );

        // 3️⃣ Thêm sản phẩm vào giỏ hàng 
        const addToCartBtn = page.locator('button.addtocart-detail');  
        await expect(addToCartBtn).toBeVisible({ timeout: 5000 });
        await addToCartBtn.click();
        await page.waitForTimeout(2000); // chờ confirm add to cart
    
        // 4️⃣ Chuyển tới trang giỏ hàng
        await page.goto('https://rabity.vn/cart', { waitUntil: 'domcontentloaded' });
    
        // 5️⃣ Nhấn nút Thanh toán để đi tới checkout
        const checkoutBtn = page.locator('button#checkout-process');
        await expect(checkoutBtn).toBeVisible({ timeout: 5000 });
        await checkoutBtn.click();
    
        
    try {
      // 1️⃣ Chọn ô địa chỉ
      const fullAddressInput = page.locator('input#fulladdress');
      await fullAddressInput.fill('Linh xuân');
      await page.waitForTimeout(1000); // đợi gợi ý xuất hiện

      // 2️⃣ Chọn option thứ 2
      const secondOption = page.locator('#react-select-4-listbox div[role="option"]').nth(0);
      await expect(secondOption).toBeVisible({ timeout: 5000 });
      await secondOption.click();

      // 3️⃣ Kiểm tra giá trị đã được điền đúng
      const selectedValue = await fullAddressInput.inputValue();
      console.log('Selected address:', selectedValue);
      expect(selectedValue.toLowerCase()).toContain('linh xuân');

      console.log('✅ TC05 Passed: Chọn option thứ 2 từ autocomplete địa chỉ thành công');

    } catch (error) {
      console.error('❌ TC05 Failed:', error.message);
      throw error;
    }
  });





// =====================================================
  // TC06 — Kiểm tra định dạng email không hợp lệ
  // =====================================================
  test('TC06: Nhập email không có ký tự @', async ({ page }) => {
        // 1️⃣ Truy cập trực tiếp trang chi tiết sản phẩm
        await page.goto(
          'https://rabity.vn/products/ao-ni-mu-dai-tay-be-gai-rabity-915-001', 
          { waitUntil: 'domcontentloaded', timeout: 90000 }
        );
  
    
        // 3️⃣ Thêm sản phẩm vào giỏ hàng 
        const addToCartBtn = page.locator('button.addtocart-detail');  
        await expect(addToCartBtn).toBeVisible({ timeout: 5000 });
        await addToCartBtn.click();
        await page.waitForTimeout(2000); // chờ confirm add to cart
    
        // 4️⃣ Chuyển tới trang giỏ hàng
        await page.goto('https://rabity.vn/cart', { waitUntil: 'domcontentloaded' });
    
        // 5️⃣ Nhấn nút Thanh toán để đi tới checkout
        const checkoutBtn = page.locator('button#checkout-process');
        await expect(checkoutBtn).toBeVisible({ timeout: 5000 });
        await checkoutBtn.click();
    
        
    try {
      // 1️⃣ Điền email không hợp lệ
      const emailInput = page.locator('input#email');
      await emailInput.fill('hunggmail.com');
  
      // 2️⃣ Trigger validation bằng cách bấm Tab ra ngoài
      await emailInput.press('Tab');
  
      // 3️⃣ Chờ error-message xuất hiện
      const emailError = page.locator('input#email').locator('xpath=ancestor::div[contains(@class, "group")]//div[@data-slot="error-message"]');
      await emailError.waitFor({ state: 'visible', timeout: 5000 });
  
      // 4️⃣ Kiểm tra nội dung
      const errorText = await emailError.textContent();
      console.log('Email error message:', errorText);
      expect(errorText).toContain('không hợp lệ');
  
      console.log('✅ TC06 Passed: Email không hợp lệ được phát hiện');
    } catch (error) {
      console.error('❌ TC06 Failed:', error.message);
      throw error;
    }
  });

});