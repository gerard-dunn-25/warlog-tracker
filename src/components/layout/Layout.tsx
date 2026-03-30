import Navbar from './Navbar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[url('/bg-mobile.png')] md:bg-[url('/bg-desktop.png')] bg-cover bg-center bg-no-repeat text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
