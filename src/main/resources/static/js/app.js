const ROUTES = ["home", "marketplace", "sell", "admin"];
const SESSION_KEY = "rarebid_current_user";
const FALLBACK_IMAGE = "/images/item-placeholder.svg";

const state = {
    items: [],
    filteredItems: [],
    selectedItemId: null,
    currentUser: null,
    currentPage: 1,
    pageSize: 6,
    route: "home"
};

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
});

let toastTimer = null;

document.addEventListener("DOMContentLoaded", () => {
    wireEvents();
    initAuthSession();
    initRouteFromHash();
    bindImageFallback(document.getElementById("detailImage"));
    loadItems();
});

function wireEvents() {
    document.getElementById("searchInput").addEventListener("input", () => applyFilters(true));
    document.getElementById("sortSelect").addEventListener("change", () => applyFilters(true));
    document.getElementById("bidForm").addEventListener("submit", placeBid);
    document.getElementById("createItemForm").addEventListener("submit", createItem);
    document.getElementById("refreshAdminBtn").addEventListener("click", loadItems);

    document.getElementById("openAuthBtn").addEventListener("click", openAuthModal);
    document.getElementById("closeAuthBtn").addEventListener("click", closeAuthModal);
    document.getElementById("logoutBtn").addEventListener("click", logout);

    document.getElementById("showLoginTabBtn").addEventListener("click", () => setAuthTab("login"));
    document.getElementById("showRegisterTabBtn").addEventListener("click", () => setAuthTab("register"));

    document.getElementById("loginForm").addEventListener("submit", login);
    document.getElementById("registerForm").addEventListener("submit", register);

    document.getElementById("authModal").addEventListener("click", (event) => {
        if (event.target.id === "authModal") {
            closeAuthModal();
        }
    });

    document.querySelectorAll("[data-route]").forEach((node) => {
        node.addEventListener("click", (event) => {
            event.preventDefault();
            setRoute(node.dataset.route, true);
        });
    });

    window.addEventListener("hashchange", () => {
        setRoute(readRouteFromHash(), false);
    });
}

function initAuthSession() {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) {
        updateAuthUi();
        return;
    }

    try {
        state.currentUser = JSON.parse(raw);
    } catch (error) {
        state.currentUser = null;
        window.localStorage.removeItem(SESSION_KEY);
    }

    updateAuthUi();
}

function initRouteFromHash() {
    const route = readRouteFromHash();
    setRoute(route, false);

    if (!window.location.hash) {
        window.location.hash = `#${route}`;
    }
}

function readRouteFromHash() {
    const raw = window.location.hash.replace("#", "").trim().toLowerCase();
    if (!raw || raw === "welcome") {
        return "home";
    }

    if (raw === "market") {
        return "marketplace";
    }

    if (ROUTES.includes(raw)) {
        return raw;
    }

    return "home";
}

function setRoute(route, updateHash) {
    const normalized = ROUTES.includes(route) ? route : "home";
    state.route = normalized;

    document.querySelectorAll(".app-page").forEach((page) => {
        page.classList.toggle("active", page.dataset.page === normalized);
    });

    document.querySelectorAll("[data-route]").forEach((node) => {
        node.classList.toggle("active", node.dataset.route === normalized);
    });

    if (updateHash && window.location.hash !== `#${normalized}`) {
        window.location.hash = normalized;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function openAuthModal() {
    document.getElementById("authModal").classList.remove("hidden");
    setAuthTab("login");
}

function closeAuthModal() {
    document.getElementById("authModal").classList.add("hidden");
}

function setAuthTab(tab) {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const loginTabBtn = document.getElementById("showLoginTabBtn");
    const registerTabBtn = document.getElementById("showRegisterTabBtn");

    if (tab === "register") {
        loginForm.classList.add("hidden");
        registerForm.classList.remove("hidden");
        loginTabBtn.classList.remove("active");
        registerTabBtn.classList.add("active");
        return;
    }

    registerForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
    registerTabBtn.classList.remove("active");
    loginTabBtn.classList.add("active");
}

async function login(event) {
    event.preventDefault();

    const payload = {
        username: document.getElementById("loginUsername").value.trim(),
        password: document.getElementById("loginPassword").value
    };

    if (!payload.username || !payload.password) {
        showToast("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.", true);
        return;
    }

    const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        showToast(await parseError(response), true);
        return;
    }

    const user = await response.json();
    state.currentUser = user;
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));

    document.getElementById("loginForm").reset();
    closeAuthModal();
    updateAuthUi();
    renderAdminTable();

    showToast(`Đăng nhập thành công: ${user.displayName}.`, false);
}

async function register(event) {
    event.preventDefault();

    const payload = {
        displayName: document.getElementById("registerDisplayName").value.trim(),
        username: document.getElementById("registerUsername").value.trim(),
        password: document.getElementById("registerPassword").value,
        role: document.getElementById("registerRole").value
    };

    if (!payload.displayName || !payload.username || !payload.password) {
        showToast("Vui lòng nhập đầy đủ thông tin đăng ký.", true);
        return;
    }

    const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        showToast(await parseError(response), true);
        return;
    }

    const user = await response.json();
    state.currentUser = user;
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));

    document.getElementById("registerForm").reset();
    closeAuthModal();
    updateAuthUi();
    renderAdminTable();

    showToast(`Tạo tài khoản thành công: ${user.displayName}.`, false);
}

function logout() {
    state.currentUser = null;
    window.localStorage.removeItem(SESSION_KEY);
    updateAuthUi();
    renderAdminTable();
    showToast("Đã đăng xuất.", false);
}

function updateAuthUi() {
    const userBadge = document.getElementById("userBadge");
    const openAuthBtn = document.getElementById("openAuthBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const bidderNameInput = document.getElementById("bidderName");

    if (!state.currentUser) {
        userBadge.textContent = "Chưa đăng nhập";
        openAuthBtn.hidden = false;
        logoutBtn.hidden = true;
        bidderNameInput.value = "";
        bidderNameInput.placeholder = "VD: Mai Tấn Phát";
        return;
    }

    userBadge.textContent = `${state.currentUser.displayName} (${getRoleLabel(state.currentUser.role)})`;
    openAuthBtn.hidden = true;
    logoutBtn.hidden = false;
    bidderNameInput.value = state.currentUser.displayName;
}

async function loadItems() {
    try {
        const response = await fetch("/api/items");
        if (!response.ok) {
            throw new Error(await parseError(response));
        }

        state.items = await response.json();
        updateStats();
        applyFilters(false);
        renderAdminTable();

        if (!state.selectedItemId && state.filteredItems.length > 0) {
            const firstVisible = getVisibleItems()[0] || state.filteredItems[0];
            if (firstVisible) {
                await selectItem(firstVisible.id);
            }
            return;
        }

        if (state.selectedItemId) {
            const stillExists = state.items.some((item) => item.id === state.selectedItemId);
            if (!stillExists) {
                state.selectedItemId = null;
                clearItemDetail();
                renderBidHistory([]);
            } else {
                renderSelectionState();
                renderItemDetail(getSelectedItem());
            }
        }
    } catch (error) {
        showToast(error.message || "Không tải được danh sách vật phẩm.", true);
    }
}

function applyFilters(resetPage = true) {
    const searchText = document.getElementById("searchInput").value.trim().toLowerCase();
    const sort = document.getElementById("sortSelect").value;

    if (resetPage) {
        state.currentPage = 1;
    }

    state.filteredItems = state.items.filter((item) => {
        if (!searchText) {
            return true;
        }

        const target = `${item.name} ${item.category || ""} ${item.description || ""}`.toLowerCase();
        return target.includes(searchText);
    });

    if (sort === "priceDesc") {
        state.filteredItems.sort((a, b) => Number(b.currentPrice) - Number(a.currentPrice));
    } else if (sort === "priceAsc") {
        state.filteredItems.sort((a, b) => Number(a.currentPrice) - Number(b.currentPrice));
    } else {
        state.filteredItems.sort((a, b) => Number(b.id) - Number(a.id));
    }

    const pageCount = getPageCount();
    if (state.currentPage > pageCount) {
        state.currentPage = Math.max(1, pageCount);
    }

    renderItemGrid();
    renderMarketPager();

    if (state.filteredItems.length === 0) {
        state.selectedItemId = null;
        clearItemDetail();
        renderBidHistory([]);
        return;
    }

    const visibleItems = getVisibleItems();
    const selectedVisible = visibleItems.some((item) => item.id === state.selectedItemId);

    if (!selectedVisible) {
        const firstVisible = visibleItems[0];
        if (firstVisible) {
            void selectItem(firstVisible.id);
        }
        return;
    }

    renderSelectionState();
    renderItemDetail(getSelectedItem());
}

function getPageCount() {
    if (state.filteredItems.length === 0) {
        return 1;
    }
    return Math.max(1, Math.ceil(state.filteredItems.length / state.pageSize));
}

function getVisibleItems() {
    const start = (state.currentPage - 1) * state.pageSize;
    const end = start + state.pageSize;
    return state.filteredItems.slice(start, end);
}

function renderItemGrid() {
    const grid = document.getElementById("itemsGrid");
    const pageItems = getVisibleItems();

    if (state.filteredItems.length === 0) {
        grid.innerHTML = "<div class='items-empty'>Không tìm thấy vật phẩm phù hợp.</div>";
        return;
    }

    grid.innerHTML = pageItems
        .map((item) => `
            <article class="item-card ${item.id === state.selectedItemId ? "active" : ""}" data-item-id="${item.id}">
                <img class="item-thumb" data-fallback="true" src="${escapeAttr(normalizeImage(item.imageUrl))}" alt="${escapeAttr(item.name)}" loading="lazy">
                <div class="item-top">
                    <p class="item-title">${escapeHtml(item.name)}</p>
                    <span class="item-tag">${escapeHtml(item.category || "Khác")}</span>
                </div>
                <p class="item-meta">${escapeHtml(shortText(item.description || "Chưa có mô tả.", 80))}</p>
                <p class="item-price">${formatCurrency(item.currentPrice)}</p>
            </article>
        `)
        .join("");

    bindImageFallbacks(grid);

    grid.querySelectorAll(".item-card").forEach((card) => {
        card.addEventListener("click", () => {
            const itemId = Number(card.dataset.itemId);
            void selectItem(itemId);
        });
    });
}

function renderMarketPager() {
    const pager = document.getElementById("marketPager");
    const totalPages = getPageCount();

    if (state.filteredItems.length === 0 || totalPages <= 1) {
        pager.innerHTML = "";
        return;
    }

    pager.innerHTML = `
        <button type="button" class="pager-btn" data-page-action="prev" ${state.currentPage <= 1 ? "disabled" : ""}>Trước</button>
        <span class="pager-info">Trang ${state.currentPage}/${totalPages}</span>
        <button type="button" class="pager-btn" data-page-action="next" ${state.currentPage >= totalPages ? "disabled" : ""}>Sau</button>
    `;

    pager.querySelectorAll("[data-page-action]").forEach((button) => {
        button.addEventListener("click", () => {
            const action = button.dataset.pageAction;
            const nextPage = action === "prev" ? state.currentPage - 1 : state.currentPage + 1;
            changePage(nextPage);
        });
    });
}

function changePage(page) {
    const totalPages = getPageCount();
    const normalized = Math.min(totalPages, Math.max(1, page));
    if (normalized === state.currentPage) {
        return;
    }

    state.currentPage = normalized;
    renderItemGrid();
    renderMarketPager();

    const visibleItems = getVisibleItems();
    const selectedVisible = visibleItems.some((item) => item.id === state.selectedItemId);
    if (!selectedVisible && visibleItems.length > 0) {
        void selectItem(visibleItems[0].id);
    } else {
        renderSelectionState();
    }
}

async function selectItem(itemId) {
    state.selectedItemId = Number(itemId);
    renderSelectionState();
    renderItemDetail(getSelectedItem());
    await loadBidHistory();
}

function renderSelectionState() {
    document.querySelectorAll(".item-card").forEach((card) => {
        card.classList.toggle("active", Number(card.dataset.itemId) === state.selectedItemId);
    });
}

function renderItemDetail(item) {
    if (!item) {
        clearItemDetail();
        return;
    }

    setText("detailName", item.name);
    setText("detailCategory", item.category || "Khác");
    setText("detailStatus", item.status === "OPEN" ? "ĐANG MỞ" : "ĐÃ ĐÓNG");
    setText("detailStartPrice", formatCurrency(item.startingPrice));
    setText("detailCurrentPrice", formatCurrency(item.currentPrice));
    setText("detailCreatedAt", formatDate(item.createdAt));
    setText("detailDescription", item.description || "Chưa có mô tả.");
    setText("bidItemHint", `Bạn đang đặt giá cho vật phẩm #${item.id}: ${item.name}`);

    const detailImage = document.getElementById("detailImage");
    setImageSource(detailImage, normalizeImage(item.imageUrl), item.name);

    const minBid = Math.floor(Number(item.currentPrice || 0) + 1);
    const bidAmountInput = document.getElementById("bidAmount");
    bidAmountInput.min = String(minBid);
    bidAmountInput.placeholder = `Tối thiểu ${minBid}`;

    document.getElementById("bidSubmitBtn").disabled = item.status !== "OPEN";
    if (item.status !== "OPEN") {
        setText("bidItemHint", "Phiên đã đóng. Quản trị viên cần mở lại để tiếp tục đặt giá.");
    }
}

function clearItemDetail() {
    setText("detailName", "-");
    setText("detailCategory", "-");
    setText("detailStatus", "-");
    setText("detailStartPrice", "-");
    setText("detailCurrentPrice", "-");
    setText("detailCreatedAt", "-");
    setText("detailDescription", "Chọn một vật phẩm để xem mô tả.");
    setText("bidItemHint", "Chọn vật phẩm ở bên trên trước.");
    setImageSource(document.getElementById("detailImage"), FALLBACK_IMAGE, "Ảnh mặc định");
    document.getElementById("bidSubmitBtn").disabled = true;
}

async function loadBidHistory() {
    if (!state.selectedItemId) {
        renderBidHistory([]);
        return;
    }

    try {
        const response = await fetch(`/api/items/${state.selectedItemId}/bids`);
        if (!response.ok) {
            throw new Error(await parseError(response));
        }

        const bids = await response.json();
        renderBidHistory(bids);
    } catch (error) {
        showToast(error.message || "Không tải được lịch sử đặt giá.", true);
        renderBidHistory([]);
    }
}

function renderBidHistory(bids) {
    const history = document.getElementById("bidHistory");

    if (!bids || bids.length === 0) {
        history.innerHTML = "<li class='history-empty'>Chưa có lượt đặt giá nào.</li>";
        return;
    }

    history.innerHTML = bids.map((bid) => `
        <li class="history-item">
            <div><strong>${formatCurrency(bid.amount)}</strong></div>
            <div>${escapeHtml(bid.bidderName)}</div>
            <div>${escapeHtml(formatDate(bid.bidTime))}</div>
        </li>
    `).join("");
}

async function placeBid(event) {
    event.preventDefault();

    if (!ensureRole(["BIDDER", "ADMIN"], "Bạn cần đăng nhập với vai trò Người đấu giá hoặc Quản trị viên để đặt giá.")) {
        return;
    }

    if (!state.selectedItemId) {
        showToast("Bạn cần chọn vật phẩm trước khi đặt giá.", true);
        return;
    }

    const item = getSelectedItem();
    if (!item || item.status !== "OPEN") {
        showToast("Phiên đã đóng. Không thể đặt giá.", true);
        return;
    }

    const bidderName = document.getElementById("bidderName").value.trim();
    const amount = Number(document.getElementById("bidAmount").value);

    if (!bidderName || Number.isNaN(amount) || amount <= 0) {
        showToast("Vui lòng nhập đúng tên và số tiền đặt giá.", true);
        return;
    }

    const response = await fetch(`/api/items/${state.selectedItemId}/bids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bidderName, amount })
    });

    if (!response.ok) {
        showToast(await parseError(response), true);
        return;
    }

    document.getElementById("bidAmount").value = "";
    await loadItems();
    await loadBidHistory();
    showToast("Đặt giá thành công.", false);
}

async function createItem(event) {
    event.preventDefault();

    if (!ensureRole(["SELLER", "ADMIN"], "Bạn cần đăng nhập với vai trò Người bán hoặc Quản trị viên để đăng sản phẩm.")) {
        return;
    }

    const payload = {
        name: document.getElementById("itemName").value.trim(),
        category: document.getElementById("itemCategory").value.trim(),
        description: document.getElementById("itemDescription").value.trim(),
        imageUrl: document.getElementById("itemImageUrl").value.trim(),
        startingPrice: Number(document.getElementById("itemStartingPrice").value)
    };

    if (!payload.name || Number.isNaN(payload.startingPrice) || payload.startingPrice <= 0) {
        showToast("Tên vật phẩm và giá khởi điểm là bắt buộc.", true);
        return;
    }

    const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        showToast(await parseError(response), true);
        return;
    }

    const createdItem = await response.json();
    document.getElementById("createItemForm").reset();

    setRoute("marketplace", true);
    await loadItems();
    await selectItem(createdItem.id);
    showToast("Đã tạo phiên đấu giá mới.", false);
}

function renderAdminTable() {
    const tbody = document.getElementById("adminTableBody");

    if (state.items.length === 0) {
        tbody.innerHTML = "<tr><td colspan='7' class='items-empty'>Chưa có dữ liệu.</td></tr>";
        return;
    }

    const sorted = [...state.items].sort((a, b) => Number(b.id) - Number(a.id));
    const isAdmin = hasRole("ADMIN");

    tbody.innerHTML = sorted
        .map((item) => {
            const isOpen = item.status === "OPEN";
            const nextStatus = isOpen ? "CLOSED" : "OPEN";
            const actionClass = isOpen ? "table-btn-close" : "table-btn-open";
            const actionText = isOpen ? "Đóng phiên" : "Mở lại";
            const statusClass = isOpen ? "status-open" : "status-closed";
            const statusLabel = isOpen ? "ĐANG MỞ" : "ĐÃ ĐÓNG";
            const actionHtml = isAdmin
                ? `<button
                        type="button"
                        class="table-btn ${actionClass}"
                        data-status-toggle="true"
                        data-item-id="${item.id}"
                        data-next-status="${nextStatus}">
                        ${actionText}
                   </button>`
                : "<span class='table-disabled-text'>Chỉ quản trị viên</span>";

            return `
                <tr>
                    <td>#${item.id}</td>
                    <td><img class="admin-thumb" data-fallback="true" src="${escapeAttr(normalizeImage(item.imageUrl))}" alt="${escapeAttr(item.name)}"></td>
                    <td>${escapeHtml(item.name)}</td>
                    <td>${escapeHtml(item.category || "Khác")}</td>
                    <td>${formatCurrency(item.currentPrice)}</td>
                    <td><span class="status-pill ${statusClass}">${statusLabel}</span></td>
                    <td>${actionHtml}</td>
                </tr>
            `;
        })
        .join("");

    bindImageFallbacks(tbody);

    if (!isAdmin) {
        return;
    }

    tbody.querySelectorAll("[data-status-toggle='true']").forEach((button) => {
        button.addEventListener("click", async () => {
            button.disabled = true;
            const itemId = Number(button.dataset.itemId);
            const nextStatus = button.dataset.nextStatus;
            await updateItemStatus(itemId, nextStatus);
        });
    });
}

async function updateItemStatus(itemId, nextStatus) {
    if (!ensureRole(["ADMIN"], "Bạn cần đăng nhập với vai trò Quản trị viên.")) {
        return;
    }

    const response = await fetch(`/api/items/${itemId}/status?value=${nextStatus}`, {
        method: "PATCH"
    });

    if (!response.ok) {
        showToast(await parseError(response), true);
        return;
    }

    await loadItems();
    if (state.selectedItemId === itemId) {
        await loadBidHistory();
    }

    showToast(nextStatus === "CLOSED" ? "Đã đóng phiên đấu giá." : "Đã mở lại phiên đấu giá.", false);
}

function updateStats() {
    const total = state.items.length;
    const openItems = state.items.filter((item) => item.status === "OPEN").length;
    const highest = state.items.reduce((max, item) => Math.max(max, Number(item.currentPrice || 0)), 0);

    setText("totalItems", String(total));
    setText("openItems", String(openItems));
    setText("highestPrice", formatCurrency(highest));
}

function hasRole(role) {
    return state.currentUser && state.currentUser.role === role;
}

function ensureRole(roles, message) {
    if (!state.currentUser) {
        showToast("Bạn cần đăng nhập trước.", true);
        openAuthModal();
        return false;
    }

    if (!roles.includes(state.currentUser.role)) {
        showToast(message, true);
        return false;
    }

    return true;
}

function getRoleLabel(role) {
    if (role === "ADMIN") {
        return "Quản trị viên";
    }
    if (role === "SELLER") {
        return "Người bán";
    }
    return "Người đấu giá";
}

function getSelectedItem() {
    return state.items.find((item) => item.id === state.selectedItemId) || null;
}

function normalizeImage(value) {
    if (!value || !String(value).trim()) {
        return FALLBACK_IMAGE;
    }

    const url = String(value).trim();
    if (/^(https?:\/\/|\/|data:image\/)/i.test(url)) {
        return url;
    }

    return FALLBACK_IMAGE;
}

function setImageSource(image, source, alt) {
    if (!image) {
        return;
    }

    image.alt = alt || "Ảnh vật phẩm";
    image.dataset.fallbackApplied = "0";
    image.src = source;

    if (source === FALLBACK_IMAGE) {
        image.classList.add("is-fallback");
    } else {
        image.classList.remove("is-fallback");
    }

    bindImageFallback(image);
}

function bindImageFallbacks(root) {
    if (!root) {
        return;
    }

    root.querySelectorAll("img[data-fallback='true']").forEach((image) => {
        bindImageFallback(image);
    });
}

function bindImageFallback(image) {
    if (!image || image.dataset.fallbackBound === "1") {
        return;
    }

    image.dataset.fallbackBound = "1";
    if (!image.dataset.fallbackApplied) {
        image.dataset.fallbackApplied = "0";
    }

    image.addEventListener("error", () => {
        if (image.dataset.fallbackApplied === "1") {
            return;
        }

        image.dataset.fallbackApplied = "1";
        image.classList.add("is-fallback");
        image.src = FALLBACK_IMAGE;
    });

    image.addEventListener("load", () => {
        if ((image.currentSrc || image.src).includes("item-placeholder.svg")) {
            image.classList.add("is-fallback");
        } else {
            image.classList.remove("is-fallback");
        }
    });
}

function setText(id, value) {
    const node = document.getElementById(id);
    if (node) {
        node.textContent = value;
    }
}

function formatCurrency(value) {
    return currencyFormatter.format(Number(value || 0));
}

function formatDate(value) {
    if (!value) {
        return "-";
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return parsed.toLocaleString("vi-VN");
}

function shortText(value, maxLength) {
    if (value.length <= maxLength) {
        return value;
    }
    return `${value.slice(0, maxLength - 1)}...`;
}

async function parseError(response) {
    try {
        const payload = await response.json();
        if (payload && payload.message) {
            return payload.message;
        }
    } catch (error) {
    }
    return `Yêu cầu thất bại (${response.status}).`;
}

function showToast(message, isError) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.remove("success", "error");
    toast.classList.add(isError ? "error" : "success", "show");

    if (toastTimer) {
        window.clearTimeout(toastTimer);
    }

    toastTimer = window.setTimeout(() => {
        toast.classList.remove("show");
    }, 2600);
}

function escapeHtml(raw) {
    const div = document.createElement("div");
    div.textContent = raw;
    return div.innerHTML;
}

function escapeAttr(raw) {
    return escapeHtml(raw).replace(/"/g, "&quot;");
}
