import { Monitor, FileImage } from "lucide-react"

export const HERO_CONTENT = {
  title: "Sistem Informasi Inventarisasi & Peminjaman Peralatan",
  subtitle: "Laboratorium Teknik Informatika",
  description:
    "Mempermudah pengelolaan inventaris dan peminjaman peralatan laboratorium, melakukan pencatatan, peminjaman, pengembalian dan status per alatan secara efisien.",
  buttonText: "Register",
  imageSrc: "/robot-mascot.png",
  imageAlt: "SIMPEL-TI Robot Mascot",
}

export const SERVICES_CONTENT = {
  title: "OUR SERVICES",
  description:
    "Berikut adalah layanan utama yang tersedia dalam sistem ini untuk memudahkan pengelolaan barang dan proses peminjaman.",
  services: [
    {
      title: "INVENTARISASI",
      description:
        "Lihat semua alat yang tersedia/tidak tersedia serta Data alat dilengkapi lengkap dan real agar kamu tidak perlu ribet lagi mengecek.",
      icon: Monitor,
      bgColor: "bg-blue-100",
      iconBgColor: "bg-blue-200",
      iconColor: "text-blue-600",
    },
    {
      title: "PEMINJAMAN",
      description:
        "Ajukan dan kelola peminjaman barang dengan sistematis. Pengajuan dapat melihat status persetujuan barang, melakukan pengembalian, dan menerima notifikasi peminjaman.",
      icon: FileImage,
      bgColor: "bg-blue-200",
      iconBgColor: "bg-blue-300",
      iconColor: "text-blue-700",
    },
  ],
}

export const FAQ_CONTENT = {
  title: "FAQ (Frequently Asked Question)",
  subtitle: "Pertanyaan yang Sering Diajukan",
  faqs: [
    {
      question: "Bagaimana cara mendaftar akun di SIMPEL-TI?",
      answer:
        "Untuk mendaftar akun di SIMPEL-TI, klik tombol 'Register' pada halaman utama dan isi formulir pendaftaran dengan data yang valid.",
    },
    {
      question: "Siapa saja yang dapat menggunakan sistem ini?",
      answer:
        "Sistem ini dapat digunakan oleh mahasiswa, dosen, dan staff Teknik Informatika yang memiliki akun terdaftar.",
    },
    {
      question: "Bagaimana cara meminjam alat laboratorium?",
      answer:
        "Setelah login, pilih menu 'Peminjaman', cari alat yang ingin dipinjam, isi formulir peminjaman, dan tunggu persetujuan dari admin laboratorium.",
    },
    {
      question: "Berapa lama proses persetujuan peminjaman?",
      answer: "Proses persetujuan peminjaman biasanya memakan waktu 1-2 hari kerja setelah pengajuan disubmit.",
    },
    {
      question: "Apakah ada denda jika terlambat mengembalikan alat?",
      answer: "Ya, terdapat denda keterlambatan sesuai dengan ketentuan yang berlaku di laboratorium.",
    },
    {
      question: "Apa yang harus dilakukan jika alat yang dipinjam rusak atau hilang?",
      answer: "Segera laporkan kepada admin laboratorium dan ikuti prosedur penggantian yang berlaku.",
    },
    {
      question: "Bagaimana cara memeriksa inventaris perangkat?",
      answer:
        "Gunakan fitur 'Inventarisasi' untuk melihat daftar lengkap perangkat laboratorium beserta status ketersediaannya.",
    },
  ],
}
