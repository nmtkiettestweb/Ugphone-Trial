const TOKEN = "ff9e8259be982cfc6974e55fcd0fa1556ef516487f5036";
const API_BASE = "https://hoang.cloud/dev";
let selectedRegion = "";

const REGION_CONFIG = {
    "Singapore": { id: "SG", flag: "https://flagcdn.com/w20/sg.png" },
    "Hong Kong": { id: "HK", flag: "https://flagcdn.com/w20/hk.png" },
    "Japan": { id: "JP", flag: "https://flagcdn.com/w20/jp.png" },
    "Germany": { id: "DE", flag: "https://flagcdn.com/w20/de.png" },
    "America": { id: "US", flag: "https://flagcdn.com/w20/us.png" }
};

function addLog(msg, color = "#00d9ff") {
    const term = document.getElementById('terminal');
    const time = new Date().toLocaleTimeString('vi-VN', { hour12: false });
    const div = document.createElement('div');
    div.className = 'log-line';
    div.innerHTML = `<span class="ts">[${time}]</span> <span style="color:${color}">${msg}</span>`;
    term.appendChild(div);
    term.scrollTop = term.scrollHeight;
}

// Hàm render nút server - Chống lỗi mất nút
async function loadServers() {
    try {
        const res = await fetch(`${API_BASE}/check_status_ugphone?token=${TOKEN}`);
        const result = await res.json();
        
        // Nếu API có lỗi, mặc định cho tất cả là Online để người dùng vẫn nhấn được
        const data = (result.success && result.data) ? result.data : 
                     {"Singapore": true, "Hong Kong": true, "Japan": true, "Germany": true, "America": true};

        const grid = document.getElementById('serverList');
        grid.innerHTML = "";

        Object.entries(data).forEach(([name, status]) => {
            const config = REGION_CONFIG[name] || { id: name, flag: "" };
            const item = document.createElement('div');
            item.className = `server-item ${!status ? 'off' : ''}`;
            if (config.id === selectedRegion) item.classList.add('active');

            item.innerHTML = `
                <img src="${config.flag}" alt="">
                <span>${name}</span>
                <div class="dot ${status ? 'on' : 'off'}"></div>
            `;

            if (status) {
                item.onclick = () => {
                    document.querySelectorAll('.server-item').forEach(el => el.classList.remove('active'));
                    item.classList.add('active');
                    selectedRegion = config.id;
                    addLog(`Đã chọn Server: ${name}`);
                };
            }
            grid.appendChild(item);
        });
    } catch (e) {
        addLog("Lỗi: Không thể đồng bộ trạng thái server.", "#ef4444");
    }
}

document.getElementById('btnAction').onclick = async function() {
    const input = document.getElementById('inputData').value.trim();
    if (!selectedRegion) return addLog("Lỗi: Vui lòng chọn cụm Server!", "#ef4444");
    if (!input) return addLog("Lỗi: Vui lòng nhập dữ liệu đầu vào!", "#ef4444");

    this.disabled = true;
    addLog(`Đang khởi tạo máy tại ${selectedRegion}...`);

    try {
        const res = await fetch(`${API_BASE}/buy_device_cloud`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: TOKEN,
                cloud_id: "UG",
                server: selectedRegion,
                input_data: input
            })
        });

        const resData = await res.json();
        addLog(resData.message, resData.success ? "#10b981" : "#ef4444");
    } catch (e) {
        addLog("Lỗi: Kết nối API mua máy thất bại.", "#ef4444");
    } finally {
        this.disabled = false;
        loadServers();
    }
};

document.getElementById('clearLog').onclick = () => {
    document.getElementById('terminal').innerHTML = '';
    addLog("Đã dọn dẹp nhật ký.");
};

// Khởi chạy
loadServers();
setInterval(loadServers, 20000); // Tự động cập nhật mỗi 20s
addLog("Hệ thống UGPhone Trial sẵn sàng.");
