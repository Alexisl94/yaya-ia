/**
 * Landing Page
 * Homepage for Doggo platform
 */

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Zap, Shield, MessageSquare, TrendingUp, Clock } from "lucide-react"
import { DoggoLogo } from "@/components/ui/doggo-logo"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <DoggoLogo size="sm" />
            <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Doggo</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Connexion</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
                Commencer gratuitement
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 flex justify-center">
            <DoggoLogo size="lg" className="animate-bounce-slow" />
          </div>

          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 px-4 py-2 text-sm">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="text-amber-800">Propulsé par l'IA de dernière génération</span>
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Votre compagnon IA qui{" "}
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              vous simplifie la vie
            </span>
          </h1>

          <p className="mb-8 text-lg text-slate-600 sm:text-xl md:px-12">
            Un assistant intelligent toujours à vos côtés pour répondre à vos questions,
            automatiser vos tâches et booster votre productivité. Parfait pour les indépendants,
            freelances et petites entreprises.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/signup">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all">
                Essayer gratuitement
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-2 border-amber-200 hover:bg-amber-50">
                Se connecter
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Gratuit pour commencer • Aucune carte bancaire requise • Prêt en 2 minutes
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-gradient-to-b from-amber-50/30 to-orange-50/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Pourquoi choisir Doggo ?
            </h2>
            <p className="text-lg text-slate-600">
              Un assistant IA simple et efficace, conçu pour vous accompagner au quotidien
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-xl border-2 border-amber-100 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 to-orange-100">
                <Zap className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-slate-900">Facile à utiliser</h3>
              <p className="text-slate-600">
                Pas besoin d'être expert en tech. Discutez simplement avec Doggo comme vous le feriez avec un ami.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-xl border-2 border-amber-100 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 to-orange-100">
                <MessageSquare className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-slate-900">Toujours disponible</h3>
              <p className="text-slate-600">
                24h/24, 7j/7. Doggo est là quand vous en avez besoin, prêt à vous aider sur n'importe quel sujet.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-xl border-2 border-amber-100 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 to-orange-100">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-slate-900">Gagnez du temps</h3>
              <p className="text-slate-600">
                Fini les tâches répétitives. Concentrez-vous sur l'essentiel pendant que Doggo s'occupe du reste.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-xl border-2 border-amber-100 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 to-orange-100">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-slate-900">Développez votre activité</h3>
              <p className="text-slate-600">
                Améliorez votre organisation, trouvez de nouvelles idées, et boostez votre productivité au quotidien.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-xl border-2 border-amber-100 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 to-orange-100">
                <Shield className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-slate-900">Vos données protégées</h3>
              <p className="text-slate-600">
                Tout reste confidentiel. Nous respectons votre vie privée et sécurisons vos informations.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-xl border-2 border-amber-100 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 to-orange-100">
                <Sparkles className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-slate-900">IA performante</h3>
              <p className="text-slate-600">
                Alimenté par les meilleurs modèles d'IA du moment. Des réponses précises et pertinentes à chaque fois.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 p-8 text-center md:p-12 shadow-lg">
            <div className="mb-6 flex justify-center">
              <DoggoLogo size="md" />
            </div>
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl text-slate-900">
              Prêt à simplifier votre quotidien ?
            </h2>
            <p className="mb-8 text-lg text-slate-600">
              Rejoignez les milliers d'utilisateurs qui font confiance à Doggo pour les accompagner au quotidien
            </p>
            <Link href="/signup">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg hover:shadow-xl">
                Essayer Doggo gratuitement
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-slate-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <DoggoLogo size="sm" />
              <span className="font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Doggo</span>
            </div>
            <p className="text-sm text-slate-500">
              © 2025 Doggo - Tous droits réservés
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
