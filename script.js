const TOKEN = "ff9e8259be982cfc6974e55fcd0fa1556ef516487f5036";
const API_BASE = "https://hoang.cloud/dev"; 
let selectedRegion = "";

const REGION_MAP = {
    "Singapore": { id: "SG", flag: "https://flagcdn.com/w20/sg.png" },
    "Hong Kong": { id: "HK", flag: "https://flagcdn.com/w20/hk.png" },
    "Japan": { id: "JP", flag: "https://flagcdn.com/w20/jp.png" },
    "Germany": { id: "DE", flag: "https://flagcdn.com/w20/de.png" },
    "America": { id: "US", flag: "https://flagcdn.com/w20/us.png" }
};

function addLog(msg, color = "#00e5ff") {
    const term = document.getElementById('terminal');
    const time = new Date().toLocaleTimeString('vi-VN', { hour12: false });
    term.innerHTML += `<div class="log-line"><span class="ts">[${time}]</span> <span style="color:${color}">${msg}</span></div>`;
    term.scrollTop = term.scrollHeight;
}

function renderUI(dataStatus = null) {
    const grid = document.getElementById('serverList');
    grid.innerHTML = "";
    
    // Nếu API lỗi, mặc định hiển thị tất cả là xanh (true) để nút vẫn hiện
    const finalData = dataStatus || {"Singapore": true, "Hong Kong": true, "Japan": true, "Germany": true, "America": true};

    Object.entries(finalData).forEach(([name, online]) => {
        const config = REGION_MAP[name] || { id: name, flag: "" };
        const item = document.createElement('div');
        item.className = `server-item`;
        if (config.id === selectedRegion) item.classList.add('active');

        // Render nội dung nút với chấm xanh/đỏ tùy trạng thái
        item.innerHTML = `
            <img src="${config.flag}" alt="">
            <span>${name}</span>
            <div class="dot ${online ? 'on' : 'off'}"></div>
        `;

        // LUÔN CHO PHÉP CLICK kể cả khi online = false
        item.onclick = () => {
            document.querySelectorAll('.server-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            selectedRegion = config.id;
            addLog(`Đã chọn cụm: ${name} (${online ? 'Còn máy' : 'Hết máy'})`);
        };
        
        grid.appendChild(item);
    });
}

async function loadServers() {
    try {
        const res = await fetch(`${API_BASE}/check_status_ugphone?token=${TOKEN}`);
        const result = await res.json();
        if (result.success && result.data) {
            renderUI(result.data);
        } else {
            renderUI();
        }
    } catch (e) {
        renderUI();
        addLog("Cảnh báo: Không thể lấy trạng thái thực tế.", "#f59e0b");
    }
}

document.getElementById('btnAction').onclick = async function() {
    const val = document.getElementById('inputData').value.trim();
    if (!selectedRegion) return addLog("Lỗi: Bạn chưa chọn Server!", "#ef4444");
    if (!val) return addLog("Lỗi: Dữ liệu trống!", "#ef4444");

    this.disabled = true;
    addLog(`Đang gửi yêu cầu khởi tạo tại cụm ${selectedRegion}...`);

    try {
        const res = await fetch(`${API_BASE}/buy_device_cloud`, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: TOKEN,
                cloud_id: "UG",
                server: selectedRegion,
                input_data: val
            })
        });

        const data = await res.json();
        addLog(data.message, data.success ? "#10b981" : "#ef4444");
    } catch (e) {
        addLog("Lỗi: Kết nối API mua máy thất bại.", "#ef4444");
    } finally {
        this.disabled = false;
        loadServers();
    }
};

document.getElementById('clearLog').onclick = () => {
    document.getElementById('terminal').innerHTML = '';
};

renderUI(); 
loadServers();
setInterval(loadServers, 15000);
addLog("Hệ thống UGPhone Trial đã sẵn sàng.");
