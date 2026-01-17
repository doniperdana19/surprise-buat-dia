/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // AWAS: Ini akan membiarkan build sukses walau ada error tipe data
    ignoreBuildErrors: true,
  },
  // jika ada config lain tetap biarkan
};

export default nextConfig;