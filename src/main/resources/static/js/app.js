const state = {
    items: [],
    filteredItems: [],
    selectedItemId: null
};

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
});

let toastTimer = null;

document.addEventListener("DOMContentLoaded", () => {
    wireEvents();
    loadItems();
});

function wireEvents() {
    document.getElementById("searchInput").addEventListener("input", applyFilters);
    document.getElementById("sortSelect").addEventListener("change", applyFilters);
    document.getElementById("bidForm").addEventListener("submit", placeBid);
    document.getElementById("createItemForm").addEventListener("submit", createItem);
    document.getElementById("refreshAdminBtn").addEventListener("click", loadItems);
}

async function loadItems() {
    try {
        const response = await fetch("/api/items");
        if (!response.ok) {
            throw new Error(await parseError(response));
        }

        state.items = await response.json();
        updateStats();
        applyFilters();
        renderAdminTable();

        if (!state.selectedItemId && state.filteredItems.length > 0) {
            await selectItem(state.filteredItems[0].id);
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
        showToast(error.message || "Khong tai duoc danh sach vat pham.", true);
    }
}

function applyFilters() {
    const searchText = document.getElementById("searchInput").value.trim().toLowerCase();
    const sort = document.getElementById("sortSelect").value;

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

    renderItemGrid();

    if (state.filteredItems.length === 0) {
        state.selectedItemId = null;
        clearItemDetail();
        renderBidHistory([]);
        return;
    }

    const selectedInFilter = state.filteredItems.some((item) => item.id === state.selectedItemId);
    if (!selectedInFilter) {
        selectItem(state.filteredItems[0].id);
    }
}

function renderItemGrid() {
    const grid = document.getElementById("itemsGrid");

    if (state.filteredItems.length === 0) {
        grid.innerHTML = "<div class='items-empty'>Khong tim thay vat pham phu hop.</div>";
        return;
    }

    grid.innerHTML = state.filteredItems
        .map((item) => `
            <article class="item-card ${item.id === state.selectedItemId ? "active" : ""}" data-item-id="${item.id}">
                <div class="item-top">
                    <p class="item-title">${escapeHtml(item.name)}</p>
                    <span class="item-tag">${escapeHtml(item.category || "Other")}</span>
                </div>
                <p class="item-meta">${escapeHtml(shortText(item.description || "No description.", 80))}</p>
                <p class="item-price">${formatCurrency(item.currentPrice)}</p>
            </article>
        `)
        .join("");

    grid.querySelectorAll(".item-card").forEach((card) => {
        card.addEventListener("click", () => {
            const itemId = Number(card.dataset.itemId);
            selectItem(itemId);
        });
    });
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
    setText("detailCategory", item.category || "Other");
    setText("detailStatus", item.status);
    setText("detailStartPrice", formatCurrency(item.startingPrice));
    setText("detailCurrentPrice", formatCurrency(item.currentPrice));
    setText("detailCreatedAt", formatDate(item.createdAt));
    setText("detailDescription", item.description || "No description.");
    setText("bidItemHint", `Dang dat gia cho item #${item.id}: ${item.name}`);

    const minBid = Math.floor(Number(item.currentPrice || 0) + 1);
    const bidAmountInput = document.getElementById("bidAmount");
    bidAmountInput.min = String(minBid);
    bidAmountInput.placeholder = `Toi thieu ${minBid}`;

    document.getElementById("bidSubmitBtn").disabled = item.status !== "OPEN";
    if (item.status !== "OPEN") {
        setText("bidItemHint", "Phien da dong. Admin can mo lai de tiep tuc dat gia.");
    }
}

function clearItemDetail() {
    setText("detailName", "-");
    setText("detailCategory", "-");
    setText("detailStatus", "-");
    setText("detailStartPrice", "-");
    setText("detailCurrentPrice", "-");
    setText("detailCreatedAt", "-");
    setText("detailDescription", "Chon mot vat pham de xem mo ta.");
    setText("bidItemHint", "Chon item o ben tren truoc.");
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
        showToast(error.message || "Khong tai duoc lich su bid.", true);
        renderBidHistory([]);
    }
}

function renderBidHistory(bids) {
    const history = document.getElementById("bidHistory");

    if (!bids || bids.length === 0) {
        history.innerHTML = "<li class='history-empty'>Chua co luot dat gia nao.</li>";
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

    if (!state.selectedItemId) {
        showToast("Ban can chon item truoc khi dat gia.", true);
        return;
    }

    const item = getSelectedItem();
    if (!item || item.status !== "OPEN") {
        showToast("Phien da dong. Khong the dat gia.", true);
        return;
    }

    const bidderName = document.getElementById("bidderName").value.trim();
    const amount = Number(document.getElementById("bidAmount").value);

    if (!bidderName || Number.isNaN(amount) || amount <= 0) {
        showToast("Vui long nhap dung ten va so tien dat gia.", true);
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
    showToast("Dat gia thanh cong.", false);
}

async function createItem(event) {
    event.preventDefault();

    const payload = {
        name: document.getElementById("itemName").value.trim(),
        category: document.getElementById("itemCategory").value.trim(),
        description: document.getElementById("itemDescription").value.trim(),
        startingPrice: Number(document.getElementById("itemStartingPrice").value)
    };

    if (!payload.name || Number.isNaN(payload.startingPrice) || payload.startingPrice <= 0) {
        showToast("Ten vat pham va gia khoi diem la bat buoc.", true);
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

    await loadItems();
    await selectItem(createdItem.id);
    showToast("Da tao phien dau gia moi.", false);
}

function renderAdminTable() {
    const tbody = document.getElementById("adminTableBody");

    if (state.items.length === 0) {
        tbody.innerHTML = "<tr><td colspan='6' class='items-empty'>Chua co du lieu.</td></tr>";
        return;
    }

    const sorted = [...state.items].sort((a, b) => Number(b.id) - Number(a.id));

    tbody.innerHTML = sorted
        .map((item) => {
            const isOpen = item.status === "OPEN";
            const nextStatus = isOpen ? "CLOSED" : "OPEN";
            const actionClass = isOpen ? "table-btn-close" : "table-btn-open";
            const actionText = isOpen ? "Dong phien" : "Mo lai";
            const statusClass = isOpen ? "status-open" : "status-closed";

            return `
                <tr>
                    <td>#${item.id}</td>
                    <td>${escapeHtml(item.name)}</td>
                    <td>${escapeHtml(item.category || "Other")}</td>
                    <td>${formatCurrency(item.currentPrice)}</td>
                    <td><span class="status-pill ${statusClass}">${item.status}</span></td>
                    <td>
                        <button
                            type="button"
                            class="table-btn ${actionClass}"
                            data-status-toggle="true"
                            data-item-id="${item.id}"
                            data-next-status="${nextStatus}">
                            ${actionText}
                        </button>
                    </td>
                </tr>
            `;
        })
        .join("");

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

    showToast(nextStatus === "CLOSED" ? "Da dong phien dau gia." : "Da mo lai phien dau gia.", false);
}

function updateStats() {
    const total = state.items.length;
    const openItems = state.items.filter((item) => item.status === "OPEN").length;
    const highest = state.items.reduce((max, item) => Math.max(max, Number(item.currentPrice || 0)), 0);

    setText("totalItems", String(total));
    setText("openItems", String(openItems));
    setText("highestPrice", formatCurrency(highest));
}

function getSelectedItem() {
    return state.items.find((item) => item.id === state.selectedItemId) || null;
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
    return `Request that bai (${response.status}).`;
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
