export function HowItWorksSection() {
  const steps = [
    {
      number: '1',
      title: 'Crie sua conta',
      description: 'Cadastro em 30 segundos, sem cartão de crédito',
    },
    {
      number: '2',
      title: 'Registre transações',
      description: 'Pelo app ou pelo WhatsApp — como preferir',
    },
    {
      number: '3',
      title: 'Acompanhe tudo',
      description: 'Dashboard com saldo, categorias e gráficos',
    },
  ]

  return (
    <section className="py-24 px-6 bg-[hsl(220,25%,7%)] text-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-4 text-white animate-slide-up">
          Como funciona
        </h2>
        <p className="text-center text-[hsl(220,15%,65%)] mb-16 animate-slide-up delay-100">
          Comece a organizar suas finanças em 3 passos
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-7 left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`text-center relative animate-slide-up delay-${(index + 2) * 100}`}
            >
              <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center font-heading text-2xl font-bold mx-auto mb-5 shadow-[0_0_20px_rgba(16,183,127,0.25)] relative z-10 transition-transform duration-300 hover:scale-110">
                {step.number}
              </div>
              <h3 className="font-heading font-semibold text-xl mb-2 text-white">
                {step.title}
              </h3>
              <p className="text-[hsl(220,15%,65%)] max-w-[250px] mx-auto leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
