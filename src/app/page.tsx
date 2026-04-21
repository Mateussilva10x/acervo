import Link from "next/link";
import {
  BookOpen,
  Tag,
  Search,
  Clock,
  Check,
  BookMarked,
  Mic,
  Image as ImageIcon,
  FileText,
  Star,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-parchment">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-parchment/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BookMarked className="text-gold" size={20} />
            <span className="font-serif text-lg font-semibold text-leather">
              Acervo
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="inline-flex h-9 items-center px-5 rounded-xl bg-gold text-primary-foreground text-sm font-medium hover:bg-gold-dark transition-colors"
            >
              Cadastrar
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <h1 className="font-serif text-5xl md:text-6xl font-bold text-leather leading-tight mb-6">
          Acervo — O Segundo Cérebro
          <br />
          do Pregador
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
          Capture, organize e encontre suas anotações, ilustrações e
          referências bíblicas com inteligência artificial.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/register"
            className="inline-flex h-12 items-center px-8 rounded-xl bg-gold text-primary-foreground text-base font-medium hover:bg-gold-dark transition-colors shadow-sm"
          >
            Comece Gratuitamente
          </Link>
          <Link
            href="/login"
            className="inline-flex h-12 items-center px-8 rounded-xl border border-border text-foreground text-base font-medium hover:bg-secondary transition-colors"
          >
            Já tenho conta
          </Link>
        </div>
        <div className="mt-16 w-16 h-px bg-border mx-auto" />
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="font-serif text-3xl font-semibold text-leather text-center mb-12">
          Tudo que você precisa para seus sermões
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: BookOpen,
              title: "Captura Inteligente",
              desc: "Envie texto, foto de anotação ou áudio. A IA transcreve e categoriza automaticamente.",
            },
            {
              icon: Tag,
              title: "Organização por Temas",
              desc: "Suas ideias organizadas por temas bíblicos, referências e data de uso.",
            },
            {
              icon: Search,
              title: "Busca Semântica",
              desc: "Busque por intenção: 'história sobre superação' encontra Davi e Golias.",
            },
            {
              icon: Clock,
              title: "Controle de Uso",
              desc: "Saiba quando e onde usou cada ilustração para não ser repetitivo.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-card p-6 flex flex-col items-center text-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                <Icon size={20} className="text-gold" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-foreground">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Como Funciona */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="font-serif text-3xl font-semibold text-leather text-center mb-4">
          Como funciona
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
          Três passos simples para organizar todo o seu conhecimento pastoral.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              icon: Mic,
              title: "Capture",
              desc: "Grave um áudio, tire foto de uma anotação ou escreva sua ideia. A IA processa e extrai o conteúdo.",
            },
            {
              step: "02",
              icon: Tag,
              title: "Organize",
              desc: "A IA sugere temas, referências bíblicas e tags. Você revisa e confirma em segundos.",
            },
            {
              step: "03",
              icon: Search,
              title: "Encontre",
              desc: "Busque por intenção, tema ou referência. Recupere exatamente o que precisa, quando precisa.",
            },
          ].map(({ step, icon: Icon, title, desc }) => (
            <div key={step} className="relative flex flex-col items-center text-center">
              <div className="text-5xl font-serif font-bold text-gold/20 mb-4">
                {step}
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-gold/30 bg-gold/10 flex items-center justify-center mb-4">
                <Icon size={20} className="text-gold" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Prova Social */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="font-serif text-3xl font-semibold text-leather text-center mb-12">
          O que dizem os pastores
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Pr. João Ferreira",
              church: "Igreja Batista Central, SP",
              text: "Nunca mais perco uma ideia. Anoto no celular e quando vou preparar o sermão, tudo está organizado e acessível.",
            },
            {
              name: "Pr. Marcos Oliveira",
              church: "Igreja Presbiteriana da Graça, MG",
              text: "A busca semântica é incrível. Digito 'história sobre perdão' e ela encontra exatamente o que eu precisava, mesmo sem lembrar o título.",
            },
            {
              name: "Pr. Paulo Rocha",
              church: "Comunidade Evangélica, RS",
              text: "Em 20 anos de ministério, nunca tive uma ferramenta assim. É como ter um assistente pessoal que conhece toda a minha biblioteca.",
            },
          ].map(({ name, church, text }) => (
            <div key={name} className="rounded-xl border border-border bg-card p-6">
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-gold text-gold" />
                ))}
              </div>
              <p className="text-sm text-foreground leading-relaxed mb-4">
                &ldquo;{text}&rdquo;
              </p>
              <div>
                <p className="text-sm font-semibold text-foreground">{name}</p>
                <p className="text-xs text-muted-foreground">{church}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="font-serif text-3xl font-semibold text-leather text-center mb-12">
          Planos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Free */}
          <div className="rounded-xl border border-border bg-card p-8">
            <h3 className="font-serif text-xl font-semibold text-foreground mb-1">
              Gratuito
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Para começar a organizar
            </p>
            <div className="mb-6">
              <span className="font-serif text-4xl font-bold text-foreground">
                R$&nbsp;0
              </span>
              <span className="text-muted-foreground text-sm">/mês</span>
            </div>
            <ul className="space-y-3 mb-8">
              {["Até 50 notas", "Busca simples", "Categorização manual"].map(
                (f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                    <Check size={14} className="text-gold shrink-0" />
                    {f}
                  </li>
                )
              )}
            </ul>
            <Link
              href="/register"
              className="block w-full h-10 flex items-center justify-center rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              Escolher Plano
            </Link>
          </div>

          {/* Pro */}
          <div className="rounded-xl border-2 border-gold bg-card p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
              Popular
            </div>
            <h3 className="font-serif text-xl font-semibold text-foreground mb-1">
              Pro
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Para pregadores dedicados
            </p>
            <div className="mb-6">
              <span className="font-serif text-4xl font-bold text-foreground">
                R$&nbsp;39
              </span>
              <span className="text-muted-foreground text-sm">/mês</span>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                "Notas ilimitadas",
                "Busca por IA",
                "Transcrição de áudio",
                "OCR de imagens",
                "Exportação PDF",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                  <Check size={14} className="text-gold shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="block w-full h-10 flex items-center justify-center rounded-xl bg-gold text-primary-foreground text-sm font-medium hover:bg-gold-dark transition-colors"
            >
              Escolher Plano
            </Link>
          </div>

          {/* Igreja */}
          <div className="rounded-xl border border-border bg-card p-8">
            <h3 className="font-serif text-xl font-semibold text-foreground mb-1">
              Igreja
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Para equipes pastorais
            </p>
            <div className="mb-6">
              <span className="font-serif text-4xl font-bold text-foreground">
                R$&nbsp;99
              </span>
              <span className="text-muted-foreground text-sm">/mês</span>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                "Tudo do Pro",
                "Biblioteca compartilhada",
                "Múltiplos usuários",
                "Suporte prioritário",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                  <Check size={14} className="text-gold shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="block w-full h-10 flex items-center justify-center rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              Escolher Plano
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="font-serif text-4xl font-bold text-leather mb-4">
          Comece hoje mesmo
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Junte-se a centenas de pastores que já organizam seus sermões de
          forma inteligente.
        </p>
        <Link
          href="/register"
          className="inline-flex h-12 items-center px-10 rounded-xl bg-gold text-primary-foreground text-base font-medium hover:bg-gold-dark transition-colors shadow-sm"
        >
          Criar conta grátis
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <p className="text-center text-sm text-muted-foreground">
          © 2026 Acervo. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
