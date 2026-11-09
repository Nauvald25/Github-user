
let chartObj = null;

function quickAudit(user) {
    document.getElementById("usernameInput").value = user;
    performAudit();
}

async function performAudit() {
    const user = document.getElementById("usernameInput").value.trim();
    const errBox = document.getElementById("errorMessage");

    if (!user) return;
    errBox.style.display = "none";
    document.getElementById("landing").style.display = "none";
    document.getElementById("loading").style.display = "block";
    
    try {
        
        const [uRes, rRes] = await Promise.all([
        fetch(`https://api.github.com/users/${user}`),
        fetch(
            `https://api.github.com/users/${user}/repos?per_page=100&sort=stargazers`
          ),
        ]);
    if (uRes.status === 403)
    throw new Error("Github Api Limit, Coba Lagi Dalam 1 Menit");
    if (!uRes.ok) throw new Error("User Tidak Di Temukan");
    const u = await uRes.json();
    const repos = await rRes.json();

    document.getElementById("res-img").src = u.avatar_url;
    document.getElementById("res-name").innerText = u.name || u.login;
    document.getElementById("res-login").innerText = `@${u.login}`;
    document.getElementById("res-bio").innerText =
    u.bio || "";

    const totalStars = repos.reduce((a, b) => a + b.stargazers_count, 0);
    document.getElementById("s-repo").innerText = u.public_repos;
    document.getElementById("s-star").innerText = totalStars;
    document.getElementById("s-follow").innerText = u.followers;

    const valUsd = totalStars * 15 + u.followers * 10 + u.public_repos * 5;
    const kursIdr = 17000;

    document.getElementById("res-idr").innerText = new Intl.NumberFormat(
        "id-ID",
        { style: "currency", currency: "IDR", maximumFractionDigits: 0 }
      ).format(valUsd * kursIdr);
        document.getElementById("res-usd").innerText = new Intl.NumberFormat(
        "en-US",
        { style: "currency", currency: "USD" }
        ).format(valUsd);
        const baseScore =
      u.followers * 0.4 + totalStars * 0.8 + u.public_repos * 0.1;
    const score = Math.min(
    100,
      Math.round(baseScore > 0 ? 20 + Math.log10(baseScore + 1) * 20 : 0)
    );

    document.getElementById("res-score").innerText = score;
    document.getElementById("res-badge").innerText =
    score > 85
        ? "ELITE ARCHITECT"
        : score > 60
        ? "PRO DEVELOPER"
        : "RISING STAR";

    
    document.getElementById("repoBody").innerHTML = repos
        .slice(0, 6)
        .map(
        (r) => `
            <tr>
                <td><b style="color: var(--text-main)">${r.name}</b></td>
                <td><span style="color:var(--accent); font-weight: bold; font-size: 12px;">${
                    r.language || "Mixed"
                }</span></td>
                <td><i class="fas fa-star" style="color:#eac54f; font-size: 12px;"></i> ${r.stargazers_count.toLocaleString()}</td>
            </tr>
        `
    )
    .join("");

    const langMap = {};
    repos.forEach((r) => {
      if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1;
    });

    const labels = Object.keys(langMap)
      .sort((a, b) => langMap[b] - langMap[a])
      .slice(0, 5);
    const data = labels.map((l) => langMap[l]);

    renderChart(labels, data);

    document.getElementById("loading").style.display = "none";
    document.getElementById("dash").style.display = "block";
  } catch (err) {
    document.getElementById("loading").style.display = "none";
    document.getElementById("landing").style.display = "block";
    errBox.innerText = err.message;
    errBox.style.display = "block";
  }
}

function renderChart(labels, data) {
  const ctx = document.getElementById("skillChart").getContext("2d");
  if (chartObj) chartObj.destroy();

  chartObj = new Chart(ctx, {
    type: "radar",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: "rgba(47, 129, 247, 0.2)",
          borderColor: "#2f81f7",
          borderWidth: 3,
          pointBackgroundColor: "#2f81f7",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "#2f81f7",
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        r: {
          grid: { color: "rgba(255,255,255,0.05)" },
          angleLines: { color: "rgba(255,255,255,0.1)" },
          ticks: { display: false },
          pointLabels: { color: "#8b949e", font: { size: 11, weight: "bold" } },
        },
      },
    },
  });
}


