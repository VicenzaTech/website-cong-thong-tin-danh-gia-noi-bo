import * as route from "@/app/api/users/route";

async function run() {
  try {
    const fakeRequest = {
      json: async () => ({
        maNhanVien: `DIRECT_TEST_${Date.now()}`,
        hoTen: "Direct Test",
        email: "direct.test@example.com",
        phongBanId: "pb69",
        role: "nhan_vien",
        trangThaiKH: true,
        boPhan: "Bộ phận nghiệp vụ",
      }),
    } as any;

    // call POST and log result
    const res = await route.POST(fakeRequest as any);
    console.log('Route response:', res);
  } catch (err) {
    console.error('Direct call error:', err);
  }
}

run();
