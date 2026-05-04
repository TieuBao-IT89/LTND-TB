/**
 * AI Phân loại tin tức — POST /predict, chip từ #topics-data (backend).
 * sampleTexts / màu chip chỉ phục vụ demo; không giả mạo kết quả mô hình.
 */
document.addEventListener("DOMContentLoaded", () => {
    const newsInput = document.getElementById("newsInput");
    const predictBtn = document.getElementById("predictBtn");
    const clearBtn = document.getElementById("clearBtn");
    const charCount = document.getElementById("charCount");
    const errorBox = document.getElementById("errorBox");
    const errorText = document.getElementById("errorText");
    const outputEmpty = document.getElementById("outputEmpty");
    const resultCard = document.getElementById("resultCard");
    const resultCategoryName = document.getElementById("resultCategoryName");
    const resultDescription = document.getElementById("resultDescription");
    const confidenceBlock = document.getElementById("confidenceBlock");
    const confidencePct = document.getElementById("confidencePct");
    const confidenceTierLabel = document.getElementById("confidenceTierLabel");
    const confidenceBar = document.getElementById("confidenceBar");
    const confidenceTrack = document.getElementById("confidenceTrack");
    const confidenceNote = document.getElementById("confidenceNote");
    const quickAnalysis = document.getElementById("quickAnalysis");
    const qaChars = document.getElementById("qaChars");
    const qaWords = document.getElementById("qaWords");
    const qaTopic = document.getElementById("qaTopic");
    const qaConf = document.getElementById("qaConf");
    const demoToast = document.getElementById("demoToast");

    const MAX_CHARS = 1000;
    const MSG_EMPTY = "Vui lòng nhập nội dung tin tức trước khi phân loại.";

    /** Mẫu theo tên chủ đề (tiếng Việt) — dùng cho clipboard + textarea. */
    const sampleTexts = {
        "Bạn đọc":
            "Nhiều độc giả gửi ý kiến phản hồi về vấn đề giao thông đô thị, cho rằng cần có thêm giải pháp để giảm ùn tắc vào giờ cao điểm.",
        "Bất động sản":
            "Thị trường bất động sản ghi nhận sự quan tâm trở lại của nhà đầu tư khi nhiều dự án nhà ở được mở bán với chính sách thanh toán linh hoạt.",
        "Công nghệ":
            "Một mẫu điện thoại thông minh mới vừa được ra mắt với nhiều tính năng AI, camera cải tiến và hiệu năng mạnh mẽ hơn thế hệ trước.",
        "Công đoàn":
            "Tổ chức công đoàn triển khai nhiều hoạt động chăm lo đời sống người lao động, đặc biệt là các chương trình hỗ trợ trong dịp cuối năm.",
        "Diễn đàn":
            "Nhiều chuyên gia tham gia diễn đàn thảo luận về các giải pháp phát triển kinh tế bền vững và nâng cao chất lượng đời sống xã hội.",
        "Du lịch":
            "Ngành du lịch địa phương giới thiệu nhiều tour trải nghiệm mới nhằm thu hút du khách trong mùa hè năm nay.",
        "Gia đình - Hôn nhân":
            "Các chuyên gia tâm lý khuyến nghị các gia đình nên tăng cường chia sẻ và lắng nghe để xây dựng mối quan hệ hôn nhân bền vững.",
        "Giáo dục":
            "Bộ Giáo dục công bố phương án đổi mới chương trình học và tăng cường ứng dụng công nghệ trong giảng dạy tại các trường phổ thông.",
        "Kinh doanh":
            "Nhiều doanh nghiệp ghi nhận doanh thu tăng trưởng tích cực nhờ mở rộng kênh bán hàng trực tuyến và cải thiện chất lượng dịch vụ.",
        "Lao Động & Đời sống":
            "Người lao động tại các khu công nghiệp mong muốn được cải thiện điều kiện làm việc, thu nhập và các chính sách phúc lợi xã hội.",
        "Lao Động cuối tuần":
            "Cuối tuần, nhiều công nhân lựa chọn tham gia các hoạt động văn hóa, thể thao để thư giãn sau một tuần làm việc căng thẳng.",
        "Lao Động Xuân":
            "Số Xuân của báo giới thiệu những câu chuyện đời thường, kỷ niệm sum họp và hình ảnh đẹp về quê hương, làng nghề truyền thống trong dịp Tết.",
        "Lưu trữ":
            "Các tài liệu cũ được số hóa và sắp xếp lại nhằm phục vụ tốt hơn cho công tác tra cứu, nghiên cứu và quản lý thông tin.",
        Media:
            "Nhiều sản phẩm truyền thông đa phương tiện được đầu tư mạnh về hình ảnh, âm thanh và nội dung để thu hút người xem trên nền tảng số.",
        Video:
            "Các video ngắn tóm tắt sự kiện nóng, phỏng vấn hiện trường và đồ họa chuyển động giúp người xem nắm nhanh diễn biến trong vài phút.",
        "Người Việt tử tế":
            "Một nhóm tình nguyện viên đã giúp đỡ người dân gặp khó khăn bằng cách quyên góp thực phẩm, quần áo và các nhu yếu phẩm cần thiết.",
        "Pháp luật":
            "Cơ quan chức năng khởi tố vụ án liên quan đến hành vi vi phạm quy định quản lý kinh tế, gây thiệt hại nghiêm trọng cho doanh nghiệp.",
        "Phóng sự":
            "Phóng sự ghi lại cuộc sống của người dân vùng ven biển đang nỗ lực thích nghi với biến đổi khí hậu và tình trạng sạt lở ngày càng nghiêm trọng.",
        "Phóng sự - Điều tra":
            "Ký giả điều tra làm rõ các dấu hiệu sai phạm trong quản lý đất đai tại địa phương, thu thập chứng cứ và phản hồi từ người dân có liên quan.",
        "Quỹ TLV":
            "Quỹ hỗ trợ cộng đồng tiếp tục trao học bổng và quà tặng cho học sinh có hoàn cảnh khó khăn tại nhiều địa phương.",
        "Sổ tay kinh tế":
            "Các chuyên gia khuyến nghị người dân nên lập kế hoạch chi tiêu hợp lý, kiểm soát nợ và ưu tiên tiết kiệm trong bối cảnh giá cả biến động.",
        "Sức khỏe":
            "Các bác sĩ khuyến cáo người dân nên duy trì chế độ ăn uống lành mạnh, tập thể dục thường xuyên và khám sức khỏe định kỳ.",
        "Sự kiện Bình luận":
            "Nhiều ý kiến bình luận cho rằng sự kiện vừa qua cho thấy cần có cách nhìn thận trọng hơn trong việc đánh giá các chính sách mới.",
        "Thông tin doanh nghiệp":
            "Doanh nghiệp công bố kế hoạch mở rộng sản xuất, tuyển dụng thêm lao động và đầu tư vào dây chuyền công nghệ hiện đại.",
        "Thông tin tiện ích":
            "Người dân có thể tra cứu lịch cắt điện, thời tiết và các dịch vụ công trực tuyến thông qua cổng thông tin điện tử của địa phương.",
        "Thế giới":
            "Lãnh đạo nhiều quốc gia tham dự hội nghị quốc tế nhằm thảo luận về hợp tác kinh tế, biến đổi khí hậu và an ninh khu vực.",
        "Thể thao":
            "Đội tuyển bóng đá quốc gia giành chiến thắng trong trận đấu quan trọng, qua đó nâng cao cơ hội đi tiếp tại giải đấu khu vực.",
        "Thời sự":
            "Chính phủ ban hành chỉ đạo mới nhằm thúc đẩy phát triển kinh tế, đảm bảo an sinh xã hội và ổn định đời sống người dân.",
        "Tin bài liên quan":
            "Các tin bài liên quan tiếp tục cập nhật thêm thông tin mới về sự việc đang được dư luận quan tâm trong những ngày gần đây.",
        "Tin bài nổi bật":
            "Những tin bài nổi bật trong ngày tập trung phản ánh các sự kiện chính trị, kinh tế và xã hội được độc giả đọc và chia sẻ nhiều nhất.",
        "Tin bài xem thêm":
            "Bạn đọc có thể xem thêm các bài viết cùng chủ đề để hiểu rõ hơn về bối cảnh, nguyên nhân và tác động của sự kiện.",
        "Tin hoạt động":
            "Nhiều hoạt động cộng đồng được tổ chức nhằm nâng cao nhận thức của người dân về bảo vệ môi trường và xây dựng nếp sống văn minh.",
        "Tin tức việc làm":
            "Nhiều doanh nghiệp đang tuyển dụng lao động ở các vị trí kinh doanh, kỹ thuật và chăm sóc khách hàng với mức lương cạnh tranh.",
        "Tin địa phương":
            "Chính quyền địa phương triển khai dự án nâng cấp đường giao thông, cải thiện cảnh quan và hỗ trợ phát triển sản xuất cho người dân.",
        "Tấm Lòng Vàng":
            "Chương trình Tấm Lòng Vàng tiếp nhận nhiều đóng góp từ các nhà hảo tâm để hỗ trợ trẻ em nghèo và người dân gặp khó khăn.",
        "Tản mạn - Chuyện dọc đường":
            "Tản mạn kể chuyến đi dọc đường qua những miền quê, gặp gỡ người bán hàng rong, quán cóc ven đường và những câu chuyện nhỏ đời thường.",
        "Văn hóa - Giải trí":
            "Nhiều chương trình nghệ thuật, phim ảnh và sự kiện âm nhạc được tổ chức nhằm phục vụ nhu cầu giải trí của khán giả.",
        "Xe +":
            "Thị trường ô tô ghi nhận nhiều mẫu xe mới ra mắt với thiết kế hiện đại, tiết kiệm nhiên liệu và tích hợp nhiều công nghệ an toàn.",
        "Xã hội":
            "Nhiều địa phương triển khai các giải pháp đảm bảo trật tự đô thị, nâng cao chất lượng dịch vụ công và cải thiện đời sống người dân.",
    };

    /** Mã lớp AG News (b,t,e,m) → khóa trùng sampleTexts / nhãn chip */
    const KEY_TO_SAMPLE_KEY = {
        b: "Kinh doanh",
        t: "Công nghệ",
        e: "Văn hóa - Giải trí",
        m: "Sức khỏe",
    };

    /** short hiển thị trên chip (tiếng Việt trong ngoặc) → khóa sampleTexts */
    const SHORT_TO_SAMPLE_KEY = {
        "Khoa học & Công nghệ": "Công nghệ",
        "Giải trí": "Văn hóa - Giải trí",
    };

    function chip(bg, border, text, glow, dot) {
        return { bg, border, text, glow, dot };
    }

    const THEME = {
        tech: chip(
            "rgba(56, 189, 248, 0.14)",
            "rgba(56, 189, 248, 0.4)",
            "#e0f2fe",
            "rgba(56, 189, 248, 0.22)",
            "#38bdf8",
        ),
        amber: chip(
            "rgba(245, 158, 11, 0.12)",
            "rgba(245, 158, 11, 0.38)",
            "#fef3c7",
            "rgba(245, 158, 11, 0.2)",
            "#f59e0b",
        ),
        indigo: chip(
            "rgba(129, 140, 248, 0.16)",
            "rgba(129, 140, 248, 0.42)",
            "#e0e7ff",
            "rgba(129, 140, 248, 0.22)",
            "#a5b4fc",
        ),
        biz: chip(
            "rgba(59, 130, 246, 0.14)",
            "rgba(59, 130, 246, 0.4)",
            "#dbeafe",
            "rgba(59, 130, 246, 0.22)",
            "#60a5fa",
        ),
        health: chip(
            "rgba(52, 211, 153, 0.14)",
            "rgba(52, 211, 153, 0.4)",
            "#d1fae5",
            "rgba(52, 211, 153, 0.2)",
            "#34d399",
        ),
        sport: chip(
            "rgba(251, 146, 60, 0.14)",
            "rgba(251, 146, 60, 0.4)",
            "#ffedd5",
            "rgba(251, 146, 60, 0.22)",
            "#fb923c",
        ),
        law: chip(
            "rgba(220, 38, 38, 0.12)",
            "rgba(248, 113, 113, 0.38)",
            "#fecaca",
            "rgba(248, 113, 113, 0.2)",
            "#f87171",
        ),
        travel: chip(
            "rgba(45, 212, 191, 0.13)",
            "rgba(45, 212, 191, 0.38)",
            "#ccfbf1",
            "rgba(45, 212, 191, 0.2)",
            "#2dd4bf",
        ),
        culture: chip(
            "rgba(244, 114, 182, 0.13)",
            "rgba(244, 114, 182, 0.38)",
            "#fce7f3",
            "rgba(244, 114, 182, 0.22)",
            "#f472b6",
        ),
        world: chip(
            "rgba(125, 211, 252, 0.14)",
            "rgba(125, 211, 252, 0.4)",
            "#e0f2fe",
            "rgba(125, 211, 252, 0.22)",
            "#7dd3fc",
        ),
        society: chip(
            "rgba(16, 185, 129, 0.12)",
            "rgba(16, 185, 129, 0.38)",
            "#d1fae5",
            "rgba(16, 185, 129, 0.2)",
            "#10b981",
        ),
        times: chip(
            "rgba(100, 116, 139, 0.18)",
            "rgba(148, 163, 184, 0.42)",
            "#e2e8f0",
            "rgba(100, 116, 139, 0.25)",
            "#94a3b8",
        ),
        slate: chip(
            "rgba(148, 163, 184, 0.12)",
            "rgba(148, 163, 184, 0.36)",
            "#e2e8f0",
            "rgba(148, 163, 184, 0.2)",
            "#94a3b8",
        ),
        rose: chip(
            "rgba(251, 113, 133, 0.12)",
            "rgba(251, 113, 133, 0.38)",
            "#ffe4e6",
            "rgba(251, 113, 133, 0.2)",
            "#fb7185",
        ),
        violet: chip(
            "rgba(167, 139, 250, 0.14)",
            "rgba(167, 139, 250, 0.4)",
            "#ede9fe",
            "rgba(167, 139, 250, 0.22)",
            "#a78bfa",
        ),
        vault: chip(
            "rgba(120, 113, 198, 0.14)",
            "rgba(120, 113, 198, 0.36)",
            "#e0e7ff",
            "rgba(120, 113, 198, 0.2)",
            "#818cf8",
        ),
        work: chip(
            "rgba(14, 165, 233, 0.12)",
            "rgba(14, 165, 233, 0.38)",
            "#e0f2fe",
            "rgba(14, 165, 233, 0.2)",
            "#0ea5e9",
        ),
    };

    /** Ánh xạ từng khóa sampleTexts → preset màu (mỗi chủ đề có sắc riêng / nhóm rõ ràng). */
    const categoryColorMap = {
        "Bạn đọc": THEME.slate,
        "Bất động sản": THEME.amber,
        "Công nghệ": THEME.tech,
        "Công đoàn": THEME.rose,
        "Diễn đàn": THEME.indigo,
        "Du lịch": THEME.travel,
        "Gia đình - Hôn nhân": THEME.violet,
        "Giáo dục": THEME.indigo,
        "Kinh doanh": THEME.biz,
        "Lao Động & Đời sống": THEME.work,
        "Lao Động cuối tuần": THEME.violet,
        "Lao Động Xuân": THEME.violet,
        "Lưu trữ": THEME.vault,
        Media: THEME.tech,
        Video: THEME.tech,
        "Người Việt tử tế": THEME.rose,
        "Pháp luật": THEME.law,
        "Phóng sự": THEME.times,
        "Phóng sự - Điều tra": THEME.law,
        "Quỹ TLV": THEME.rose,
        "Sổ tay kinh tế": THEME.biz,
        "Sức khỏe": THEME.health,
        "Sự kiện Bình luận": THEME.slate,
        "Thông tin doanh nghiệp": THEME.biz,
        "Thông tin tiện ích": THEME.tech,
        "Thế giới": THEME.world,
        "Thể thao": THEME.sport,
        "Thời sự": THEME.times,
        "Tin bài liên quan": THEME.slate,
        "Tin bài nổi bật": THEME.amber,
        "Tin bài xem thêm": THEME.slate,
        "Tin hoạt động": THEME.society,
        "Tin tức việc làm": THEME.work,
        "Tin địa phương": THEME.society,
        "Tấm Lòng Vàng": THEME.rose,
        "Tản mạn - Chuyện dọc đường": THEME.slate,
        "Văn hóa - Giải trí": THEME.culture,
        "Xe +": THEME.tech,
        "Xã hội": THEME.society,
    };

    function hashChipStyle(seed) {
        let h = 0;
        const s = String(seed);
        for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
        const hue = h % 360;
        const sat = 32 + (h % 10);
        return {
            bg: `hsla(${hue}, ${sat}%, 50%, 0.14)`,
            border: `hsla(${hue}, ${sat + 6}%, 58%, 0.36)`,
            text: `hsl(${hue}, 16%, 93%)`,
            glow: `hsla(${hue}, ${sat + 8}%, 48%, 0.18)`,
            dot: `hsl(${hue}, 38%, 68%)`,
        };
    }

    /**
     * @param {string} category — khóa đã resolve (trùng sampleTexts) hoặc chuỗi bất kỳ cho fallback
     * @returns {{ bg: string, border: string, text: string, glow: string, dot: string }}
     */
    function getCategoryStyle(category) {
        const c = String(category || "");
        if (categoryColorMap[c]) return categoryColorMap[c];
        return hashChipStyle(c);
    }

    /** @type {{ key: string, short: string, full: string }[]} */
    let topics = [];
    const topicsEl = document.getElementById("topics-data");
    if (topicsEl && topicsEl.textContent) {
        try {
            topics = JSON.parse(topicsEl.textContent);
        } catch (_) {
            topics = [];
        }
    }

    const state = {
        isLoading: false,
        error: null,
        /** @type {{ label: string, category: string, confidence?: number } | null} */
        result: null,
        /** data-topic của chip vừa bấm để lấy mẫu (khác nhãn dự đoán) */
        selectedTopicKey: null,
    };

    function topicRow(topicKey) {
        return topics.find((t) => String(t.key) === String(topicKey));
    }

    /** Khóa trùng key của sampleTexts nếu có mẫu; rỗng nếu không. */
    function resolveSampleKey(row) {
        if (!row) return "";
        const k = String(row.key).trim();
        const sh = (row.short || "").trim();
        if (sampleTexts[k]) return k;
        const ab = KEY_TO_SAMPLE_KEY[k];
        if (ab && sampleTexts[ab]) return ab;
        const bridged = SHORT_TO_SAMPLE_KEY[sh];
        if (bridged && sampleTexts[bridged]) return bridged;
        if (sampleTexts[sh]) return sh;
        return "";
    }

    function getSampleTextForTopicKey(topicKey) {
        const row = topicRow(topicKey);
        const sk = resolveSampleKey(row);
        return sk && sampleTexts[sk] ? sampleTexts[sk] : null;
    }

    /** Chuỗi dùng cho màu chip (có mẫu → khóa mẫu; không → short hoặc key). */
    function getStyleCategoryForChip(topicKey) {
        const row = topicRow(topicKey);
        const sk = resolveSampleKey(row);
        if (sk) return sk;
        return (row && (row.short || row.key)) || String(topicKey);
    }

    function topicShort(key) {
        const k = String(key);
        const row = topics.find((t) => t.key === k);
        return row ? row.short : "";
    }

    function countWords(s) {
        const t = s.trim();
        if (!t) return 0;
        return t.split(/\s+/).filter(Boolean).length;
    }

    function getConfidenceTier(p) {
        if (p < 0.5) return { tierClass: "conf-tier--low", label: "Độ tin cậy thấp" };
        if (p < 0.75) return { tierClass: "conf-tier--mid", label: "Độ tin cậy trung bình" };
        return { tierClass: "conf-tier--high", label: "Độ tin cậy cao" };
    }

    function applyChipStyles() {
        document.querySelectorAll(".topic-chip").forEach((el) => {
            const topicKey = el.getAttribute("data-topic");
            if (!topicKey) return;
            const cat = getStyleCategoryForChip(topicKey);
            const s = getCategoryStyle(cat);
            el.style.setProperty("--chip-bg", s.bg);
            el.style.setProperty("--chip-border", s.border);
            el.style.setProperty("--chip-text", s.text);
            el.style.setProperty("--chip-glow", s.glow);
            el.style.setProperty("--chip-dot", s.dot);
        });
    }

    let toastTimer = 0;
    function showToast(message) {
        if (!demoToast) return;
        clearTimeout(toastTimer);
        demoToast.textContent = message;
        demoToast.classList.remove("hidden");
        demoToast.classList.remove("is-visible");
        requestAnimationFrame(() => {
            demoToast.classList.add("is-visible");
        });
        toastTimer = window.setTimeout(() => {
            demoToast.classList.remove("is-visible");
            window.setTimeout(() => {
                demoToast.classList.add("hidden");
            }, 280);
        }, 2600);
    }

    function syncTopicChips() {
        const resLabel = state.result && state.result.label != null ? String(state.result.label) : "";
        const sel = state.selectedTopicKey != null ? String(state.selectedTopicKey) : "";
        document.querySelectorAll(".topic-chip").forEach((chip) => {
            const key = chip.getAttribute("data-topic");
            if (!key) return;
            chip.classList.toggle("is-selected", !!sel && key === sel);
            chip.classList.toggle("is-active-result", !!resLabel && key === resLabel);
        });
    }

    async function handleCategoryClick(topicKey) {
        const row = topicRow(topicKey);
        const displayName = (row && row.short) || topicKey;
        const sampleKey = row ? resolveSampleKey(row) : "";
        const sampleText = sampleKey ? sampleTexts[sampleKey] : null;

        if (!sampleText) {
            showToast(`Chưa có văn bản mẫu cho chủ đề ${displayName}`);
            return;
        }

        const text = sampleText.length > MAX_CHARS ? sampleText.slice(0, MAX_CHARS) : sampleText;
        newsInput.value = text;
        state.error = null;
        state.result = null;
        state.selectedTopicKey = topicKey;
        clearError();
        newsInput.dispatchEvent(new Event("input", { bubbles: true }));
        renderFromState();
        newsInput.focus();

        const toastName = sampleKey || displayName;
        try {
            if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
                await navigator.clipboard.writeText(text);
                showToast(`Đã sao chép đoạn văn bản mẫu của chủ đề ${toastName}`);
            } else {
                throw new Error("no clipboard");
            }
        } catch {
            showToast(`Đã đưa văn bản mẫu chủ đề ${toastName} vào ô nhập`);
        }
    }

    const topicChipsIntro = document.getElementById("topicChipsIntro");
    if (topicChipsIntro) {
        topicChipsIntro.addEventListener("click", (e) => {
            const chip = e.target.closest(".topic-chip");
            if (!chip) return;
            const key = chip.getAttribute("data-topic");
            if (!key) return;
            void handleCategoryClick(key);
        });
        topicChipsIntro.addEventListener("keydown", (e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            const chip = e.target.closest(".topic-chip");
            if (!chip) return;
            e.preventDefault();
            const key = chip.getAttribute("data-topic");
            if (key) void handleCategoryClick(key);
        });
    }

    applyChipStyles();

    function syncCharCount() {
        charCount.textContent = String(Math.min(newsInput.value.length, MAX_CHARS));
    }

    function setButtonEnabledFromInput() {
        predictBtn.disabled = newsInput.value.trim().length === 0 || state.isLoading;
    }

    function setLoading(loading) {
        state.isLoading = loading;
        newsInput.disabled = loading;
        predictBtn.classList.toggle("is-loading", loading);
        if (loading) predictBtn.setAttribute("aria-busy", "true");
        else predictBtn.removeAttribute("aria-busy");
        const lab = predictBtn.querySelector(".btn-submit__label");
        if (lab) lab.textContent = loading ? "Đang phân tích..." : "Phân loại tin tức";
        setButtonEnabledFromInput();
    }

    function clearError() {
        state.error = null;
        errorText.textContent = "";
        errorBox.classList.add("hidden");
    }

    function showError(message) {
        state.error = message;
        errorText.textContent = message;
        errorBox.classList.remove("hidden");
    }

    function buildDescription(shortName) {
        const name = (shortName || "").trim();
        if (name) {
            return `Theo mô hình, nội dung này có xu hướng thuộc nhóm ${name}.`;
        }
        return "Đã nhận kết quả dự đoán từ mô hình.";
    }

    function applyConfidenceUI(p) {
        const TIER_CLASSES = ["conf-tier--low", "conf-tier--mid", "conf-tier--high"];
        TIER_CLASSES.forEach((c) => confidenceBlock.classList.remove(c));

        const has = typeof p === "number" && !Number.isNaN(p);
        if (!has || !confidenceTrack) {
            TIER_CLASSES.forEach((c) => confidenceBlock.classList.remove(c));
            confidenceBlock.classList.add("hidden");
            confidencePct.textContent = "";
            confidenceTierLabel.textContent = "";
            confidenceBar.style.width = "0%";
            confidenceTrack?.removeAttribute("aria-valuenow");
            confidenceNote.classList.add("hidden");
            confidenceNote.textContent = "";
            confidenceNote.classList.remove("result-card__note--warn", "result-card__note--ok");
            confidenceTierLabel.classList.remove("result-card__tier--low", "result-card__tier--mid", "result-card__tier--high");
            return;
        }

        const pct = Math.min(100, Math.max(0, Math.round(p * 100)));
        const { tierClass, label } = getConfidenceTier(p);

        confidenceBlock.classList.remove("hidden");
        confidenceBlock.classList.add(tierClass);
        confidencePct.textContent = `${pct}%`;
        confidenceTierLabel.textContent = label;
        confidenceTierLabel.classList.remove("result-card__tier--low", "result-card__tier--mid", "result-card__tier--high");
        if (tierClass === "conf-tier--low") confidenceTierLabel.classList.add("result-card__tier--low");
        else if (tierClass === "conf-tier--mid") confidenceTierLabel.classList.add("result-card__tier--mid");
        else confidenceTierLabel.classList.add("result-card__tier--high");

        confidenceBar.style.width = `${pct}%`;
        confidenceTrack.setAttribute("aria-valuenow", String(pct));

        confidenceNote.classList.remove("result-card__note--warn", "result-card__note--ok");
        if (p < 0.6) {
            confidenceNote.textContent =
                "Độ tin cậy chưa cao, bạn nên nhập thêm nội dung để mô hình dự đoán ổn định hơn.";
            confidenceNote.classList.add("result-card__note--warn");
            confidenceNote.classList.remove("hidden");
        } else {
            confidenceNote.textContent = "Kết quả có độ tin cậy tương đối tốt.";
            confidenceNote.classList.add("result-card__note--ok");
            confidenceNote.classList.remove("hidden");
        }
    }

    function updateQuickAnalysis(shortName, confidence) {
        const raw = newsInput.value;
        const chars = raw.length;
        const words = countWords(raw);
        qaChars.textContent = String(chars);
        qaWords.textContent = String(words);
        qaTopic.textContent = shortName || "—";

        const has = typeof confidence === "number" && !Number.isNaN(confidence);
        if (!has) {
            qaConf.textContent = "Không có độ tin cậy từ mô hình";
            return;
        }
        qaConf.textContent = getConfidenceTier(confidence).label;
    }

    function applyResultToUI(data) {
        const label = data.label != null ? String(data.label) : "";
        const shortName = topicShort(label) || (data.category || "").trim();

        resultCard.dataset.label = label;
        resultCategoryName.textContent = shortName || "—";
        resultDescription.textContent = buildDescription(shortName);

        applyConfidenceUI(data.confidence);
        updateQuickAnalysis(shortName, data.confidence);

        outputEmpty.classList.add("hidden");
        resultCard.classList.remove("hidden");
        quickAnalysis.classList.remove("hidden");
    }

    function showEmptyOutput() {
        outputEmpty.classList.remove("hidden");
        resultCard.classList.add("hidden");
        resultCard.dataset.label = "";
        quickAnalysis.classList.add("hidden");
        applyConfidenceUI(NaN);
    }

    function renderFromState() {
        syncCharCount();
        if (state.error) showError(state.error);
        else clearError();

        if (state.result) applyResultToUI(state.result);
        else showEmptyOutput();

        setButtonEnabledFromInput();
        syncTopicChips();
    }

    newsInput.addEventListener("input", () => {
        state.error = null;
        syncCharCount();
        setButtonEnabledFromInput();
        clearError();
    });

    clearBtn.addEventListener("click", () => {
        newsInput.value = "";
        state.error = null;
        state.result = null;
        state.selectedTopicKey = null;
        clearError();
        renderFromState();
        newsInput.focus();
    });

    predictBtn.addEventListener("click", async () => {
        const text = newsInput.value.trim();
        clearError();
        state.error = null;

        if (!text) {
            state.error = MSG_EMPTY;
            renderFromState();
            return;
        }

        setLoading(true);
        state.error = null;

        try {
            const response = await fetch("/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Không thể phân loại. Vui lòng thử lại.");
            }

            state.result = {
                label: data.label,
                category: data.category,
                confidence: data.confidence,
            };
            state.selectedTopicKey = null;
        } catch (err) {
            state.error = err.message || "Đã xảy ra lỗi.";
        } finally {
            setLoading(false);
            renderFromState();
        }
    });

    state.result = null;
    state.error = null;
    state.selectedTopicKey = null;
    renderFromState();
});
