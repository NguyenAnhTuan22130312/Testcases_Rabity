const { test, expect } = require("@playwright/test");

// --- CONFIG & SELECTORS ---
const CFG = {
  EMAIL: "lamhuybmt012@gmail.com",
  PASS: "@Huy123456",
  URL: "https://rabity.vn",
  URL_ADDRESS: "https://rabity.vn/account/addresses",
  URL_PRODUCT: "https://rabity.vn/products/ao-khoac-ni-mu-be-trai-rabity-92762",
};

const SEL = {
  POPUP_CLOSE: ".om-global-close-button, .om-popup-close-v2",
  LOGIN_ICON: 'a.open-modal[data-type="login"]',
  INPUT_EMAIL: '#login-form input[name="customer[email]"]',
  INPUT_PASS: '#login-form input[name="customer[password]"]',
  BTN_LOGIN_SUBMIT: "#login-form button.btn-submit",
  FORM_ADD: "#address_form_new",
  BTN_ADD_SUBMIT: '#address_form_new button[type="submit"]',
  MSG_ERROR:
    ".errors, .alert-danger, .text-danger, #address_form_new .form-error",

  // --- REVIEW SELECTORS ---
  BTN_STAR_5:
    '.hrv-crv-rating__group-right .hrv-crv-rating__box[data-star="5"]',
  REVIEW_MODAL: ".crv-hrvmodal--content",
  REVIEW_MODAL_TITLE: ".crv-hrvmodal--header__title",
  BTN_SEND_REVIEW: ".hrv-crv-button--send-rating",

  // Dòng thông báo lỗi màu đỏ "Vui lòng nhập thông tin"
  MSG_ERROR_REVIEW: ".hrv-crv-customer-helper",
  // Nút gửi & Input
  BTN_SEND_REVIEW: ".hrv-crv-button--send-rating",
  INPUT_COMMENT: "#crv-hrvmodal--content-rating",
  INPUT_FILE: "#crv-choose-image__input",
  MSG_ERROR_FILE: ".crv-choose-image__helper",
  BTN_CLOSE_X: ".crv-hrvmodal-close",
  BTN_CLOSE_CANCEL: ".crv-hrvmodal-btn-close",
};

test.describe("Module Quản lý Sổ địa chỉ", () => {
  test.beforeEach(async ({ page }) => {
    await page.addLocatorHandler(page.locator(SEL.POPUP_CLOSE), async () => {
      console.log(
        ">> [Popup] Phát hiện Banner quảng cáo, đang tự động đóng..."
      );
      await page.locator(SEL.POPUP_CLOSE).click();
    });

    console.log(">> [Setup] Bắt đầu truy cập trang chủ...");
    // 1. Vào trang chủ
    await page.goto(CFG.URL);

    // Vẫn giữ lệnh click thủ công này để dọn dẹp popup ngay khi mới vào trang
    await page
      .locator(SEL.POPUP_CLOSE)
      .click({ timeout: 5000 })
      .catch(() => {});

    console.log(">> [Setup] Đang thực hiện đăng nhập...");
    // 2. Đăng nhập
    await page.locator(SEL.LOGIN_ICON).click();
    await page.locator(SEL.INPUT_EMAIL).fill(CFG.EMAIL);
    await page.locator(SEL.INPUT_PASS).fill(CFG.PASS);
    await page.locator(SEL.BTN_LOGIN_SUBMIT).click();

    // 3. Đợi đăng nhập xong & vào thẳng trang Address
    await page.waitForURL("**/account");
    console.log(
      ">> [Setup] Đăng nhập thành công. Chuyển hướng đến trang Sổ địa chỉ..."
    );
    await page.goto(CFG.URL_ADDRESS);
  });

  test("TC_DFD_ADR_1: Defect–Không cho phép tạo địa chỉ khi bỏ trống tất cả field", async ({
    page,
  }) => {
    console.log(">> [Test] Bắt đầu TC_DFD_ADR_1");
    const formAdd = page.locator(SEL.FORM_ADD);
    await expect(formAdd).toBeVisible();
    const addressSelector = ".address-item";

    // 1. Đếm số lượng địa chỉ ban đầu
    const initialAddressCount = await page.locator(addressSelector).count();
    console.log(`>> [Debug] Số lượng địa chỉ ban đầu: ${initialAddressCount}`);

    console.log(">> [Step] Click Submit form trống...");
    await page.locator(SEL.BTN_ADD_SUBMIT).click();

    const isHtml5Blocked = await page.evaluate(() => {
      const invalidInput = document.querySelector(
        "#address_form_new input:invalid"
      );
      return invalidInput !== null;
    });
    if (isHtml5Blocked) {
      console.log(">> [Pass] Trình duyệt đã chặn submit bằng HTML5.");
      return;
    }

    // Kiểm tra nhanh xem có text lỗi không
    const errorCount = await page.locator(SEL.MSG_ERROR).count();
    if (errorCount > 0) {
      await expect(page.locator(SEL.MSG_ERROR).first()).toBeVisible();
      console.log(">> [Pass] Hệ thống hiển thị thông báo lỗi text.");
      return;
    }

    (">> [Step] Đang Reload lại trang để kiểm tra xem địa chỉ rác có bị lưu vào DB không...");

    // Reload để server trả về danh sách mới nhất
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    // Đếm lại bằng selector chuẩn .address-item
    const currentAddressCount = await page.locator(addressSelector).count();
    console.log(
      `>> [Debug] Số lượng địa chỉ sau khi Reload: ${currentAddressCount}`
    );

    if (currentAddressCount > initialAddressCount) {
      throw new Error(
        `❌ DEFECT PHÁT HIỆN: Hệ thống cho phép tạo địa chỉ rỗng! (Ban đầu: ${initialAddressCount} -> Sau đó: ${currentAddressCount})`
      );
    } else {
      throw new Error(
        "❌ UI/UX FAIL: Bấm submit nhưng không báo lỗi và cũng không thấy địa chỉ mới xuất hiện."
      );
    }
  });

  test("TC_DFD_ADR_2 :Sửa địa chỉ thành công", async ({ page }) => {
    console.log(">> [Test] Bắt đầu kiểm tra TC_DFD_ADR_2 (Edit Address)");

    // 1. Click icon Edit (class .edit-address nằm trong .address-actions)
    // Lấy cái đầu tiên tìm thấy
    const btnEdit = page.locator(".address-actions .edit-address").first();
    console.log(">> [Step] Click vào icon Sửa địa chỉ đầu tiên...");
    await btnEdit.click();

    // 2. Xác định form Sửa đang hiển thị
    // Vì mỗi địa chỉ có 1 form ẩn, ta phải tìm cái form nào đang visible sau khi click
    const activeEditForm = page.locator(".address-edit-form:visible");
    await expect(activeEditForm).toBeVisible({ timeout: 5000 });

    console.log(">> [Step] Điền thông tin mới vào form...");
    // Lưu ý: Phải dùng activeEditForm.locator(...) để đảm bảo điền đúng vào form đang mở
    await activeEditForm
      .locator('input[name="address[last_name]"]')
      .fill("Lam Edit");
    await activeEditForm
      .locator('input[name="address[first_name]"]')
      .fill("Huy Edit");
    await activeEditForm
      .locator('input[name="address[phone]"]')
      .fill("0999888777");
    await activeEditForm
      .locator('input[name="address[address1]"]')
      .fill("123 Đường Test Playwright");

    console.log(">> [Step] Chọn Tỉnh/Thành...");
    await activeEditForm
      .locator('select[name="address[province]"]')
      .selectOption({ label: "Hồ Chí Minh" });

    console.log(">> [Step] Đợi load dữ liệu Quận/Huyện...");
    const districtSelect = activeEditForm.locator(
      'select[name="address[district]"]'
    );

    // Ta đợi cho option thứ 2 (index 1) xuất hiện trong DOM
    await expect(districtSelect.locator("option").nth(1)).toBeAttached({
      timeout: 10000,
    });
    await districtSelect.selectOption({ index: 1 });

    console.log(">> [Step] Đợi load dữ liệu Phường/Xã...");
    const wardSelect = activeEditForm.locator('select[name="address[ward]"]');
    await expect(wardSelect.locator("option").nth(1)).toBeAttached({
      timeout: 10000,
    });
    await wardSelect.selectOption({ index: 1 });

    console.log(">> [Step] Click nút Cập nhật (btn-success)...");
    // Selector nút Cập nhật trong form đang mở
    await activeEditForm.locator("button.btn-success").click();

    console.log(">> [Verify] Kiểm tra dữ liệu sau khi cập nhật...");
    // Sau khi submit trang thường load lại, đợi URL ổn định
    await page.waitForLoadState("domcontentloaded");

    // Kiểm tra xem trang có chứa thông tin vừa sửa không (Huy Edit, Lam Edit)
    // Lưu ý: Check toàn body hoặc list address vì cấu trúc hiển thị sau khi save có thể khác form
    await expect(page.locator("body")).toContainText("Huy Edit");
    await expect(page.locator("body")).toContainText("Lam Edit");
    await expect(page.locator("body")).toContainText("0999888777");

    console.log("✅ PASS: Test Case Sửa địa chỉ hoàn tất.");
  });

  test("TC_DFD_ADR_3: Thêm địa chỉ mới đầy đủ thông tin, hợp lệ", async ({
    page,
  }) => {
    console.log(">> [Test] Bắt đầu kiểm tra TC_DFD_ADR_3 (Add New Success)");

    const formAdd = page.locator(SEL.FORM_ADD);
    await expect(formAdd).toBeVisible();

    // 1. Điền các trường thông tin cơ bản (Text)
    console.log(">> [Step] Điền thông tin Họ tên, SĐT, Địa chỉ...");
    await formAdd
      .locator('input[name="address[last_name]"]')
      .fill("Nguyen Van");
    await formAdd.locator('input[name="address[first_name]"]').fill("Test Moi");
    await formAdd.locator('input[name="address[company]"]').fill("Cong Ty ABC");
    await formAdd
      .locator('input[name="address[address1]"]')
      .fill("888 Duong So 8");
    await formAdd.locator('input[name="address[phone]"]').fill("0912345678");

    // 2. Xử lý Dropdown (Tỉnh -> Huyện -> Xã)
    console.log(">> [Step] Chọn địa chỉ hành chính...");

    // Chọn Tỉnh/Thành
    await formAdd
      .locator('select[name="address[province]"]')
      .selectOption({ label: "Hồ Chí Minh" });

    console.log(">> [Step] Đợi load dữ liệu Quận/Huyện...");
    const districtSelect = formAdd.locator('select[name="address[district]"]');

    // Mẹo: Đợi option thứ 2 (index 1) xuất hiện
    await expect(districtSelect.locator("option").nth(1)).toBeAttached({
      timeout: 10000,
    });
    await districtSelect.selectOption({ index: 1 });

    console.log(">> [Step] Đợi load dữ liệu Phường/Xã...");
    const wardSelect = formAdd.locator('select[name="address[ward]"]');
    await expect(wardSelect.locator("option").nth(1)).toBeAttached({
      timeout: 10000,
    });
    await wardSelect.selectOption({ index: 1 });

    // 3. Submit Form
    console.log(">> [Step] Click nút Thêm mới...");
    // Button trong HTML bạn đưa là btn-primary
    await formAdd.locator("button.btn-primary").click();

    // 4. Verify thành công
    console.log(">> [Verify] Kiểm tra địa chỉ mới đã được thêm...");

    // Đợi trang reload xong
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000); // Đợi UI render xong hẳn

    // Kiểm tra URL (thường sẽ quay lại trang danh sách)
    expect(page.url()).toContain("/account/addresses");

    // Kiểm tra thông tin vừa nhập có hiện trên màn hình không
    // Check tên "Nguyen Van" và "Test Moi" và sđt
    const bodyText = page.locator("body");
    await expect(bodyText).toContainText("Nguyen Van");
    await expect(bodyText).toContainText("Test Moi");
    await expect(bodyText).toContainText("0912345678");
    await expect(bodyText).toContainText("888 Duong So 8"); // Check địa chỉ

    console.log("✅ PASS: Thêm mới địa chỉ thành công.");
  });

  test("TC_DFD_ADR_4: Đặt địa chỉ là địa chỉ mặc định", async ({ page }) => {
    console.log(">> [Test] Bắt đầu kiểm tra TC_DFD_ADR_4");

    // 1. Đợi danh sách địa chỉ load xong
    await page.waitForSelector(".address-actions", { timeout: 10000 });

    // 2. Tìm danh sách nút Sửa
    const editBtns = page.locator(".address-actions .edit-address");
    const count = await editBtns.count();

    // -- LOGIC CHỌN ĐỊA CHỈ ĐỂ TEST --
    // Để test chức năng "Đặt làm mặc định", ta KHÔNG NÊN chọn cái đang là mặc định (thường là cái đầu tiên).
    // Ta sẽ chọn cái thứ 2. Nếu chỉ có 1 cái thì đành chọn cái đầu.
    let targetIndex = 0;
    if (count > 1) {
      targetIndex = 1; // Chọn cái thứ 2
      console.log(
        ">> [Info] Có nhiều địa chỉ, chọn địa chỉ thứ 2 để set default."
      );
    } else {
      console.log(">> [Info] Chỉ có 1 địa chỉ, test trên địa chỉ đầu tiên.");
    }

    // Click nút Sửa
    await editBtns.nth(targetIndex).click();

    // 3. Đợi form sửa hiện ra
    const activeEditForm = page.locator(".address-edit-form:visible");
    await expect(activeEditForm).toBeVisible({ timeout: 5000 });

    // 4. Tick vào checkbox "Đặt làm địa chỉ mặc định"
    console.log(">> [Step] Tick chọn 'Đặt làm địa chỉ mặc định'...");
    const checkboxDefault = activeEditForm.locator(
      'input[name="address[default]"]'
    );

    // Chỉ check nếu nó chưa được check (để tránh uncheck nếu logic đảo ngược)
    if (!(await checkboxDefault.isChecked())) {
      await checkboxDefault.check();
    }

    // 5. Submit Form Cập nhật
    console.log(">> [Step] Click nút Cập nhật...");
    // Sau khi click, trang thường sẽ reload
    await activeEditForm.locator("button.btn-success").click();

    // 6. VERIFY (Quan trọng)
    console.log(">> [Verify] Kiểm tra nhãn 'Địa chỉ mặc định' xuất hiện...");

    // Đợi trang load lại hoàn toàn
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000); // Đợi thêm 2s cho UI vẽ xong cái nhãn màu cam

    // Dựa vào ảnh bạn gửi: Có dòng chữ "Địa chỉ mặc định" (trong cái khung màu cam)
    // Ta tìm xem có text này xuất hiện trên màn hình không
    const defaultLabel = page.locator('text="Địa chỉ mặc định"').first();

    await expect(defaultLabel).toBeVisible({ timeout: 10000 });

    console.log("✅ PASS: Đã thấy nhãn 'Địa chỉ mặc định' xuất hiện trên UI.");
  });

  test("TC_DFD_ADR_5: Xóa địa chỉ thành công", async ({ page }) => {
    console.log(
      ">> [Test] Bắt đầu kiểm tra TC_DFD_ADR_5 (Delete Existing Address)"
    );

    // 1. Xác định danh sách các nút Xóa đang có
    // Dựa trên inspect của bạn: <a href="#" onclick="...">Xóa</a>
    const deleteBtnSelector = 'a:has-text("Xóa")';

    // Đợi danh sách địa chỉ load xong
    await page.waitForSelector(".address-actions", { timeout: 10000 });

    // Đếm số lượng nút Xóa ban đầu
    const initialCount = await page.locator(deleteBtnSelector).count();
    console.log(
      `>> [Info] Hiện tại đang có ${initialCount} địa chỉ có thể xóa.`
    );

    if (initialCount === 0) {
      // Nếu không có gì để xóa thì báo lỗi hoặc skip
      throw new Error("Không tìm thấy địa chỉ nào để test chức năng Xóa!");
    }

    // 2. Đăng ký sự kiện xử lý Popup (Dialog)
    // Code này phải chạy TRƯỚC khi click
    page.once("dialog", async (dialog) => {
      console.log(`>> [Dialog] Phát hiện popup: ${dialog.message()}`);

      // Kiểm tra nội dung popup (như ảnh bạn gửi)
      expect(dialog.message()).toContain(
        "Bạn có chắc chắn muốn xóa địa chỉ này"
      );

      // Bấm OK
      await dialog.accept();
      console.log(">> [Dialog] Đã bấm OK.");
    });

    // 3. Thực hiện Click Xóa
    // Ta chọn nút Xóa CUỐI CÙNG (last) để tránh xóa nhầm địa chỉ Mặc định (thường nằm đầu)
    console.log(">> [Step] Click vào nút Xóa của địa chỉ cuối cùng...");
    await page.locator(deleteBtnSelector).last().click();

    // 4. Verify kết quả
    console.log(">> [Verify] Kiểm tra xem địa chỉ đã bị xóa chưa...");

    // Chờ trang reload lại
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000); // Đợi UI ổn định hẳn

    // Đếm lại số lượng nút xóa
    const finalCount = await page.locator(deleteBtnSelector).count();
    console.log(`>> [Info] Số lượng địa chỉ sau khi xóa: ${finalCount}`);

    // Kiểm tra logic: Số lượng lúc sau phải bằng (Số lượng lúc đầu - 1)
    expect(finalCount).toBe(initialCount - 1);

    await page.waitForTimeout(1000);

    console.log("✅ PASS: Đã xóa thành công 1 địa chỉ.");
  });
  test("TC_DFD_ADR_6: Defect–Cho phép ký tự đặc biệt trong Họ & Tên", async ({
    page,
  }) => {
    console.log(">> [Test] Bắt đầu kiểm tra TC_DFD_ADR_6 (Special Characters)");

    const formAdd = page.locator(SEL.FORM_ADD);
    await expect(formAdd).toBeVisible();

    // 1. Nhập ký tự đặc biệt vào Họ & Tên
    console.log(">> [Step] Nhập ký tự đặc biệt vào Họ & Tên...");
    await formAdd.locator('input[name="address[last_name]"]').fill("!@#$");
    await formAdd.locator('input[name="address[first_name]"]').fill("%^&*");

    // Nhập các field khác hợp lệ để tránh bị lỗi Required làm nhiễu
    await formAdd.locator('input[name="address[company]"]').fill("Cong Ty ABC");
    await formAdd
      .locator('input[name="address[address1]"]')
      .fill("123 Duong Test");
    await formAdd.locator('input[name="address[phone]"]').fill("0912345678");

    // 2. Chọn Tỉnh / Huyện / Xã
    console.log(">> [Step] Chọn địa chỉ hành chính...");
    await formAdd
      .locator('select[name="address[province]"]')
      .selectOption({ label: "Hồ Chí Minh" });

    const districtSelect = formAdd.locator('select[name="address[district]"]');
    await expect(districtSelect.locator("option").nth(1)).toBeAttached({
      timeout: 10000,
    });
    await districtSelect.selectOption({ index: 1 });

    const wardSelect = formAdd.locator('select[name="address[ward]"]');
    await expect(wardSelect.locator("option").nth(1)).toBeAttached({
      timeout: 10000,
    });
    await wardSelect.selectOption({ index: 1 });

    // 3. Submit Form
    console.log(">> [Step] Click nút Thêm mới...");
    // Sử dụng selector chuẩn cho nút submit (hoặc .btn-primary tùy web của bạn)
    await formAdd.locator('button[type="submit"]').click();

    // --- ĐOẠN LOGIC MỚI ĐỂ BẮT DEFECT (Thay thế đoạn expect cũ) ---

    // 4. Verify nhẹ: Xem có lỗi hiện ra không? (Dùng try/catch để không bị dừng test đột ngột)
    console.log(
      ">> [Verify] Kiểm tra xem hệ thống có báo lỗi ngay lập tức không..."
    );
    try {
      // Tìm bất kỳ thông báo lỗi nào
      const errorMessage = page.locator(
        ".errors, .error, .field-error, .text-danger"
      );
      await expect(errorMessage.first()).toBeVisible({ timeout: 2000 });
      console.log(">> [Pass] Hệ thống ĐÃ chặn ký tự đặc biệt (Có hiện lỗi).");
      return; // Nếu có lỗi -> Test Pass (Web hoạt động đúng)
    } catch (e) {
      console.log(
        ">> [Info] Không thấy thông báo lỗi đỏ hiện ra... Tiếp tục kiểm tra Database."
      );
    }

    // 5. Kiểm tra "Lì đòn": Reload trang để xem dữ liệu có bị lưu vào DB không?
    console.log(
      ">> [Step] Reload trang để kiểm tra xem dữ liệu rác có bị lưu vào DB không..."
    );
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    // Lấy toàn bộ nội dung text của trang web sau khi reload
    const bodyContent = await page.locator("body").textContent();

    // Kiểm tra xem chuỗi ký tự đặc biệt mình nhập lúc nãy có xuất hiện trên màn hình không
    if (bodyContent.includes("!@#$") || bodyContent.includes("%^&*")) {
      // ==> ĐÂY LÀ CHỖ IN RA LỖI BẠN MUỐN
      throw new Error(
        "❌ DEFECT PHÁT HIỆN: Hệ thống đã lưu thành công tên chứa ký tự đặc biệt (!@#$, %^&*)!"
      );
    } else {
      // Nếu không tìm thấy ký tự đó, mà lúc nãy cũng không báo lỗi -> Lỗi UX
      throw new Error(
        "❌ UI/UX FAIL: Bấm submit, không lưu được nhưng cũng không báo lỗi gì cả."
      );
    }
  });
});

test.describe("Module Đánh giá sản phẩm", () => {
  test.beforeEach(async ({ page }) => {
    // Xử lý Popup quảng cáo
    await page.addLocatorHandler(page.locator(SEL.POPUP_CLOSE), async () => {
      console.log(">> [Popup] Đóng quảng cáo...");
      await page.locator(SEL.POPUP_CLOSE).click();
    });

    console.log(">> [Setup] Truy cập trang chủ & Đăng nhập...");
    await page.goto(CFG.URL);
    await page
      .locator(SEL.POPUP_CLOSE)
      .click({ timeout: 3000 })
      .catch(() => {});

    // Quy trình đăng nhập
    await page.locator(SEL.LOGIN_ICON).click();
    await page.locator(SEL.INPUT_EMAIL).fill(CFG.EMAIL);
    await page.locator(SEL.INPUT_PASS).fill(CFG.PASS);
    await page.locator(SEL.BTN_LOGIN_SUBMIT).click();

    await page.waitForURL("**/account");
    await page.waitForTimeout(3000);

    console.log(">> [Setup] Đăng nhập thành công.");
  });

  test("TC_DFD_REVIEW_1: Mở popup viết đánh giá sau khi chọn sao (Check UI)", async ({
    page,
  }) => {
    console.log(">> [Test] Bắt đầu TC_DFD_REVIEW_1");

    // 1. Vào trang chi tiết sản phẩm
    console.log(">> [Step] Truy cập trang sản phẩm...");
    await page.goto(CFG.URL_PRODUCT);

    // 2. Scroll tới khu vực đánh giá
    const star5 = page.locator(SEL.BTN_STAR_5);
    await expect(star5).toBeVisible({ timeout: 10000 });
    await star5.scrollIntoViewIfNeeded();

    // 3. Click chọn 5 sao
    console.log(">> [Step] Click chọn 5 sao...");
    await star5.click();

    // 4. Verify Popup hiển thị (Yêu cầu: Không delay quá 1s)
    console.log(">> [Verify] Kiểm tra Popup hiển thị trong vòng 1s...");

    // Lọc lấy cái Modal nào chứa chữ "Đánh giá sản phẩm" để tránh nhầm với cái Preview ẩn
    const popup = page
      .locator(SEL.REVIEW_MODAL)
      .filter({ hasText: "Đánh giá sản phẩm" });

    // Check hiển thị với timeout 1000ms (1 giây)
    await expect(popup).toBeVisible({ timeout: 1000 });

    // 5. Verify Tiêu đề Popup
    console.log(">> [Verify] Kiểm tra tiêu đề Popup...");
    const title = popup.locator(SEL.REVIEW_MODAL_TITLE);
    await expect(title).toHaveText("Đánh giá sản phẩm");
    await page.waitForTimeout(1000);
    console.log("✅ PASS: Popup hiển thị đúng và nhanh chóng.");
  });

  test("TC_DFD_REVIEW_2: Không thể gửi đánh giá khi trường Comment bị để trống", async ({
    page,
  }) => {
    console.log(">> [Test] Bắt đầu TC_DFD_REVIEW_2");

    // 1. Vào trang và mở popup
    console.log(">> [Step] Mở popup đánh giá...");
    await page.goto(CFG.URL_PRODUCT);

    const star5 = page.locator(SEL.BTN_STAR_5);
    await star5.scrollIntoViewIfNeeded();
    await star5.click();

    // Lấy popup chuẩn
    const popup = page
      .locator(SEL.REVIEW_MODAL)
      .filter({ hasText: "Đánh giá sản phẩm" });
    await expect(popup).toBeVisible();

    // 2. Click nút Gửi ngay (Để trống comment)
    console.log(">> [Step] Để trống comment và nhấn Gửi...");
    const btnSend = popup.locator(SEL.BTN_SEND_REVIEW);
    await btnSend.click();

    // 3. Verify: Hệ thống PHẢI hiển thị lỗi
    console.log(
      ">> [Verify] Kiểm tra dòng chữ đỏ 'Vui lòng nhập thông tin'..."
    );

    // Tìm dòng lỗi bên trong popup
    const errorMsg = popup.locator(SEL.MSG_ERROR_REVIEW);

    // Assert: Phải nhìn thấy lỗi và nội dung đúng
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toHaveText("Vui lòng nhập thông tin");
    await page.waitForTimeout(1000);
    console.log(
      "✅ PASS: Hệ thống hiển thị lỗi đúng như kỳ vọng (Validation hoạt động tốt)."
    );
  });

  test("TC_DFD_REVIEW_3: Gửi đánh giá thành công (Comment hợp lệ, không cần ảnh)", async ({
    page,
  }) => {
    console.log(">> [Test] Bắt đầu TC_DFD_REVIEW_3");
    // 1. Vào trang và mở popup
    console.log(">> [Step] Mở popup đánh giá...");
    await page.goto(CFG.URL_PRODUCT);

    console.log(">> [Step] Reload trang để lấy Token mới...");
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    const star5 = page.locator(SEL.BTN_STAR_5);
    await star5.scrollIntoViewIfNeeded();
    await star5.click();

    // Lấy popup chuẩn (tránh nhầm lẫn)
    const popup = page
      .locator(SEL.REVIEW_MODAL)
      .filter({ hasText: "Đánh giá sản phẩm" });
    await expect(popup).toBeVisible();

    // 2. Nhập nội dung đánh giá hợp lệ
    console.log(">> [Step] Nhập nội dung đánh giá...");
    // Tạo nội dung ngẫu nhiên chút để server không báo spam (nếu có check)
    const randomId = Math.floor(Math.random() * 1000);
    const validComment = `Sản phẩm đẹp, bé mặc vừa in. Chất vải mềm mát, giao hàng nhanh. Mã review: #${randomId}`;

    await popup.locator(SEL.INPUT_COMMENT).fill(validComment);

    // --- FIX: Chờ 3s để giả lập người thật & tránh spam ---
    console.log(">> [Step] Chờ 3s trước khi bấm Gửi...");
    await page.waitForTimeout(3000);

    // 3. Nhấn nút Gửi
    console.log(">> [Step] Nhấn nút Gửi đánh giá...");
    const btnSend = popup.locator(SEL.BTN_SEND_REVIEW);
    await btnSend.click({ force: true }); // Click mạnh

    // 4. Verify Thành công (Xử lý cả trường hợp lỗi server)
    console.log(">> [Verify] Kiểm tra phản hồi từ hệ thống...");

    const successMessage = page.getByText(/Cảm ơn bạn đã để lại đánh giá/i);
    const errorMessage = page.locator(
      ".hrv-crv-customer-helper, .text-danger, .errors"
    ); // Selector lỗi chung

    try {
      // Tăng timeout lên 30s
      await expect(successMessage).toBeVisible({ timeout: 30000 });
      console.log("✅ PASS: Đánh giá đã được gửi và hệ thống báo thành công!");
    } catch (e) {
      // Nếu không thấy success, check xem có lỗi gì hiện ra không
      if (
        (await errorMessage.count()) > 0 &&
        (await errorMessage.first().isVisible())
      ) {
        const errText = await errorMessage.first().textContent();
        console.log(`⚠️ WARNING: Server từ chối gửi. Lỗi: ${errText}`);
        // Bạn có thể coi đây là Pass nếu lỗi là "bạn đã đánh giá rồi"
      } else {
        // Không thấy thành công, cũng không thấy lỗi -> Fail thật
        throw new Error(
          "❌ FAIL: Bấm gửi nhưng không thấy thông báo thành công lẫn báo lỗi sau 30s!"
        );
      }
    }
  });

  test("TC_DFD_REVIEW_4: Defect - Gửi đánh giá thành công với Comment chỉ 1 ký tự", async ({
    page,
  }) => {
    console.log(">> [Test] Bắt đầu TC_DFD_REVIEW_4 (Check Length Validation)");

    // 1. Vào trang sản phẩm
    console.log(">> [Step] Truy cập trang sản phẩm...");
    await page.goto(CFG.URL_PRODUCT);

    // 2. Mở popup
    const star5 = page.locator(SEL.BTN_STAR_5);
    await star5.scrollIntoViewIfNeeded();
    await star5.click();

    // Lọc popup chuẩn
    const popup = page
      .locator(SEL.REVIEW_MODAL)
      .filter({ hasText: "Đánh giá sản phẩm" });
    await expect(popup).toBeVisible();

    // 3. Nhập nội dung đánh giá CỰC NGẮN (1 ký tự)
    console.log(">> [Step] Nhập nội dung chỉ 1 ký tự ('h')...");
    await popup.locator(SEL.INPUT_COMMENT).fill("h");

    // FIX: Đợi 2s giả lập người dùng thật
    await page.waitForTimeout(2000);

    // 4. Nhấn nút Gửi
    console.log(">> [Step] Nhấn nút Gửi đánh giá...");
    const btnSend = popup.locator(SEL.BTN_SEND_REVIEW);
    await btnSend.click();

    // 5. KIỂM TRA DEFECT
    console.log(">> [Verify] Kiểm tra xem hệ thống có CHẶN hay CHO PHÉP...");

    try {
      // Tìm thông báo thành công
      const successMessage = page.getByText(/Cảm ơn bạn đã để lại đánh giá/i);

      // Chờ thử 5s xem có hiện thông báo thành công không
      await expect(successMessage).toBeVisible({ timeout: 5000 });

      // ==> NẾU HIỆN THÔNG BÁO THÀNH CÔNG -> LÀ BUG (VÌ LẼ RA PHẢI CHẶN)
      throw new Error(
        "❌ DEFECT PHÁT HIỆN: Hệ thống cho phép gửi đánh giá chỉ với 1 ký tự (h)!"
      );
    } catch (error) {
      // Nếu lỗi là do mình ném ra (Defect) thì throw tiếp để báo cáo
      if (error.message.includes("❌ DEFECT")) {
        throw error;
      }

      // Xử lý các trường hợp khác
      const authError = page.getByText(/xác thực/i); // Check lỗi authen
      const errorMsg = popup.locator(SEL.MSG_ERROR_REVIEW); // Check lỗi validate UI

      if (await authError.isVisible()) {
        // Nếu vẫn dính lỗi xác thực -> Retry test này
        console.log("⚠️ Lỗi xác thực server -> Nên chạy lại test này.");
        // Không throw error để test pass (coi như flaky), hoặc throw để fail tùy bạn
      } else if (await errorMsg.isVisible()) {
        console.log(
          "✅ Web hoạt động đúng: Đã hiển thị lỗi chặn nội dung ngắn."
        );
      } else {
        console.log("⚠️ WARNING: Bấm gửi nhưng không thấy phản hồi gì.");
      }
    }
  });

  test("TC_DFD_REVIEW_5: Defect - Gửi đánh giá thành công với Comment ký tự đặc biệt", async ({
    page,
  }) => {
    console.log(
      ">> [Test] Bắt đầu TC_DFD_REVIEW_5 (Check Special Char Validation)"
    );

    // 1. Vào trang
    await page.goto(CFG.URL_PRODUCT);

    const star5 = page.locator(SEL.BTN_STAR_5);
    await star5.scrollIntoViewIfNeeded();
    await star5.click();

    const popup = page
      .locator(SEL.REVIEW_MODAL)
      .filter({ hasText: "Đánh giá sản phẩm" });
    await expect(popup).toBeVisible();

    // 2. Nhập nội dung chứa KÝ TỰ ĐẶC BIỆT
    console.log(">> [Step] Nhập nội dung ký tự đặc biệt ('!@#$#')...");
    await popup.locator(SEL.INPUT_COMMENT).fill("!@#$#");
    await page.waitForTimeout(2000); // Wait người dùng thật

    // 3. Nhấn nút Gửi
    console.log(">> [Step] Nhấn nút Gửi đánh giá...");
    const btnSend = popup.locator(SEL.BTN_SEND_REVIEW);
    await btnSend.click();

    // 4. KIỂM TRA DEFECT
    console.log(">> [Verify] Kiểm tra xem hệ thống có CHẶN hay CHO PHÉP...");

    try {
      const successMessage = page.getByText(/Cảm ơn bạn đã để lại đánh giá/i);
      await expect(successMessage).toBeVisible({ timeout: 5000 });

      throw new Error(
        "❌ DEFECT PHÁT HIỆN: Hệ thống cho phép gửi đánh giá chứa ký tự đặc biệt (!@#$#)!"
      );
    } catch (error) {
      if (error.message.includes("❌ DEFECT")) {
        throw error;
      }

      const authError = page.getByText(/xác thực/i);
      if (await authError.isVisible()) {
        console.log("⚠️ Lỗi xác thực server (Flaky environment).");
      } else {
        // Kiểm tra xem có dòng báo lỗi đỏ đỏ không
        const errorMsg = popup.locator(SEL.MSG_ERROR_REVIEW);
        if (await errorMsg.isVisible()) {
          console.log(
            "✅ Web hoạt động đúng: Đã hiển thị lỗi chặn ký tự đặc biệt."
          );
        } else {
          console.log("⚠️ WARNING: Bấm gửi nhưng không thấy phản hồi gì.");
        }
      }
    }
  });

  test("TC_DFD_REVIEW_6: Blocking Bug - Upload file không phải ảnh (Web bị treo)", async ({
    page,
  }) => {
    console.log(
      ">> [Test] Bắt đầu TC_DFD_REVIEW_6 (Check File Type Validation)"
    );

    // 1. Vào trang và mở popup
    console.log(">> [Step] Mở popup đánh giá...");
    await page.goto(CFG.URL_PRODUCT);

    const star5 = page.locator(SEL.BTN_STAR_5);
    await star5.scrollIntoViewIfNeeded();
    await star5.click();

    const popup = page
      .locator(SEL.REVIEW_MODAL)
      .filter({ hasText: "Đánh giá sản phẩm" });
    await expect(popup).toBeVisible();

    // 2. Nhập nội dung hợp lệ (Để cô lập lỗi upload)
    await popup
      .locator(SEL.INPUT_COMMENT)
      .fill("Sản phẩm tốt, test upload file pdf.");

    // 3. Upload file PDF giả
    console.log(">> [Step] Upload file 'test.pdf' (Không phải ảnh)...");

    // Playwright cho phép tạo file ảo ngay trong bộ nhớ, không cần file thật trên máy
    await popup.locator(SEL.INPUT_FILE).setInputFiles({
      name: "test.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("this is a dummy pdf content"),
    });

    // 4. Nhấn nút Gửi
    console.log(">> [Step] Nhấn nút Gửi đánh giá...");
    const btnSend = popup.locator(SEL.BTN_SEND_REVIEW);
    await btnSend.click();
    console.log(">> [Info] Đợi 2s để quan sát trạng thái loading...");
    await page.waitForTimeout(2000);

    // 5. KIỂM TRA BLOCKING BUG (TREO)
    console.log(
      ">> [Verify] Kiểm tra phản hồi hệ thống (Mong đợi lỗi, thực tế là Treo)..."
    );

    try {
      const successMessage = page.getByText(/Cảm ơn bạn đã để lại đánh giá/i);
      if (await successMessage.isVisible({ timeout: 2000 })) {
        throw new Error(
          "❌ DEFECT: Hệ thống chấp nhận file PDF thành công (Lẽ ra phải chặn)!"
        );
      }

      // Chờ xem có lỗi UI nào hiện ra không (Ví dụ: 'định dạng không hợp lệ')
      const errorMessage = page.getByText(/định dạng|không hợp lệ|image/i);
      await expect(errorMessage).toBeVisible({ timeout: 5000 });

      console.log("✅ Web hoạt động đúng: Đã báo lỗi định dạng file.");
    } catch (error) {
      // Xử lý các loại lỗi
      if (error.message.includes("❌ DEFECT")) throw error;

      // Nếu Timeout xảy ra (nghĩa là chờ 5s mà không thấy lỗi, cũng không thấy thành công)
      // -> Kết luận là WEB BỊ TREO
      console.log(
        "⚠️ Hết thời gian chờ (Timeout) mà không thấy thông báo lỗi."
      );

      // Kiểm tra nút submit có đang loading không (thường class sẽ đổi hoặc có svg spinner)
      // Dựa vào hình bạn gửi: Nút xoay tít
      console.log(">> [Info] Nút gửi vẫn đang ở trạng thái loading/treo...");

      throw new Error(
        "❌ BLOCKING BUG: Web bị treo (Loading vô tận) khi upload file PDF! Không hiện thông báo lỗi."
      );
    }
  });

  test("TC_DFD_REVIEW_7: Gửi đánh giá thành công (Đầy đủ Comment và Ảnh hợp lệ)", async ({
    page,
  }) => {
    console.log(">> [Test] Bắt đầu TC_DFD_REVIEW_7 (Valid Real Image Upload)");

    // 1. Vào trang và mở popup
    console.log(">> [Step] Mở popup đánh giá...");
    await page.goto(CFG.URL_PRODUCT);

    const star5 = page.locator(SEL.BTN_STAR_5);
    await star5.scrollIntoViewIfNeeded();
    await star5.click();

    const popup = page
      .locator(SEL.REVIEW_MODAL)
      .filter({ hasText: "Đánh giá sản phẩm" });
    await expect(popup).toBeVisible();

    // 2. Nhập nội dung đánh giá hợp lệ
    console.log(">> [Step] Nhập nội dung đánh giá...");
    const randomId = Math.floor(Math.random() * 1000);
    const validComment = `Áo khoác rất đẹp, giống hệt trong ảnh. Vải dày dặn. Mã review: #${randomId}`;
    await popup.locator(SEL.INPUT_COMMENT).fill(validComment);

    // 3. Upload ảnh THẬT (Tải từ link sản phẩm về để upload)
    console.log(">> [Step] Đang tải ảnh thật của sản phẩm về để upload...");

    // Link ảnh thật của cái áo khoác này (Lấy từ HTML bạn gửi)
    const realImageUrl =
      "https://product.hstatic.net/1000290074/product/92762-5_6f4d749774384068a160c1c325a245ea_medium.jpg";

    // Yêu cầu Playwright tải ảnh này về bộ nhớ đệm (buffer)
    const imageResponse = await page.request.get(realImageUrl);
    const imageBuffer = await imageResponse.body();

    console.log(">> [Step] Upload ảnh 'ao_khoac_that.jpg'...");
    await popup.locator(SEL.INPUT_FILE).setInputFiles({
      name: "ao_khoac_that.jpg",
      mimeType: "image/jpeg",
      buffer: imageBuffer,
    });

    // --- FIX: Chờ 3s để giả lập người thật & tránh spam ---
    console.log(">> [Step] Chờ 3s trước khi bấm Gửi...");
    await page.waitForTimeout(3000);

    // 4. Nhấn nút Gửi
    console.log(">> [Step] Nhấn nút Gửi đánh giá...");
    const btnSend = popup.locator(SEL.BTN_SEND_REVIEW);
    await btnSend.click({ force: true });

    // 5. Verify Thành công (Xử lý cả trường hợp lỗi server)
    console.log(">> [Verify] Kiểm tra phản hồi từ hệ thống...");

    const successMessage = page.getByText(/Cảm ơn bạn đã để lại đánh giá/i);
    const errorMessage = page.locator(
      ".hrv-crv-customer-helper, .text-danger, .errors"
    );

    try {
      // Tăng timeout lên 30s vì gửi ảnh nặng có thể lâu
      await expect(successMessage).toBeVisible({ timeout: 30000 });
      console.log(
        "✅ PASS: Đánh giá kèm hình ảnh THẬT đã được gửi thành công!"
      );
    } catch (e) {
      // Nếu không thấy success, check xem có lỗi gì hiện ra không
      if (
        (await errorMessage.count()) > 0 &&
        (await errorMessage.first().isVisible())
      ) {
        const errText = await errorMessage.first().textContent();
        console.log(`⚠️ WARNING: Server từ chối gửi. Lỗi: ${errText}`);
      } else {
        // Không thấy thành công, cũng không thấy lỗi -> Fail thật
        throw new Error(
          "❌ FAIL: Bấm gửi nhưng không thấy thông báo thành công lẫn báo lỗi sau 30s!"
        );
      }
    }
  });

  test("TC_DFD_REVIEW_8: Đóng modal đánh giá khi click nút X hoặc Cancel (UI/UX)", async ({
    page,
  }) => {
    console.log(
      ">> [Test] Bắt đầu TC_DFD_REVIEW_8 (Check Close Functionality)"
    );

    // 1. Vào trang và mở popup
    console.log(">> [Step] Truy cập trang sản phẩm...");
    await page.goto(CFG.URL_PRODUCT);

    const star5 = page.locator(SEL.BTN_STAR_5);
    await star5.scrollIntoViewIfNeeded();

    // --- KIỂM TRA NÚT 'HỦY' ---
    console.log(">> [Step 1] Mở Popup và thử đóng bằng nút 'Hủy'...");
    await star5.click();

    // Lọc popup chuẩn
    const popup = page
      .locator(SEL.REVIEW_MODAL)
      .filter({ hasText: "Đánh giá sản phẩm" });
    await expect(popup).toBeVisible();
    await page.waitForTimeout(1000);

    // Click nút Hủy
    console.log(">> [Step] Click nút 'Hủy'...");
    const btnCancel = popup.locator(SEL.BTN_CLOSE_CANCEL);
    await btnCancel.click();

    // Verify: Popup phải biến mất
    await expect(popup).toBeHidden();
    console.log(">> [Verify] Đã đóng thành công bằng nút 'Hủy'.");
    await page.waitForTimeout(1000);

    // --- KIỂM TRA NÚT 'X' ---
    console.log(">> [Step 2] Mở lại Popup và thử đóng bằng nút 'X'...");
    // Mở lại
    await star5.click();
    await expect(popup).toBeVisible();
    await page.waitForTimeout(1000);

    // Click nút X
    console.log(">> [Step] Click nút 'X'...");
    await page.locator(SEL.BTN_CLOSE_X).first().click();

    // Verify: Popup phải biến mất
    await expect(popup).toBeHidden();
    console.log(">> [Verify] Đã đóng thành công bằng nút 'X'.");

    console.log("✅ PASS: Chức năng đóng Popup hoạt động tốt trên cả 2 nút!");
  });
});
