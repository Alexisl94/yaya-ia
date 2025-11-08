/**
 * Landing Page
 * Homepage for yaya.ia platform
 */

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Zap, Shield, MessageSquare, TrendingUp, Clock } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">yaya.ia</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Connexion</Button>
            </Link>
            <Link href="/signup">
              <Button>Commencer gratuitement</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-2 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Propulsé par l'IA de dernière génération</span>
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Votre assistant IA personnel pour{" "}
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              booster votre activité
            </span>
          </h1>

          <p className="mb-8 text-lg text-muted-foreground sm:text-xl md:px-12">
            Créez des agents IA ultra-personnalisés pour automatiser vos tâches,
            gagner du temps et développer votre business. Spécialement conçu pour
            les professionnels libéraux et entrepreneurs.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Créer mon agent gratuitement
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Se connecter
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Aucune carte bancaire requise • Configuration en 2 minutes
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Pourquoi choisir yaya.ia ?
            </h2>
            <p className="text-lg text-muted-foreground">
              Des agents IA qui comprennent vraiment votre métier et s'adaptent à vos besoins
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-lg border bg-background p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Ultra-personnalisé</h3>
              <p className="text-muted-foreground">
                Chaque agent est configuré selon votre secteur, votre expérience et vos objectifs spécifiques.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-lg border bg-background p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Conversations naturelles</h3>
              <p className="text-muted-foreground">
                Discutez avec votre agent comme avec un collègue qui connaît votre business par cœur.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-lg border bg-background p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Gagnez du temps</h3>
              <p className="text-muted-foreground">
                Automatisez les tâches répétitives et concentrez-vous sur ce qui compte vraiment.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-lg border bg-background p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Boostez votre activité</h3>
              <p className="text-muted-foreground">
                Trouvez plus de clients, améliorez votre organisation, augmentez votre CA.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-lg border bg-background p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Sécurisé & confidentiel</h3>
              <p className="text-muted-foreground">
                Vos données restent privées. Conformité RGPD et hébergement sécurisé.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-lg border bg-background p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">IA de pointe</h3>
              <p className="text-muted-foreground">
                Propulsé par Claude et GPT, les modèles d'IA les plus avancés du marché.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl rounded-2xl border bg-gradient-to-br from-primary/10 via-purple-500/10 to-primary/10 p-8 text-center md:p-12">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Prêt à transformer votre activité ?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Rejoignez des centaines de professionnels qui utilisent déjà l'IA pour développer leur business
            </p>
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Créer mon premier agent gratuitement
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold">yaya.ia</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 yaya.ia - Tous droits réservés
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
