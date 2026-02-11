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
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-4">
          Como funciona
        </h2>
        <p className="text-center text-muted-foreground mb-12">
          Comece a organizar suas finanças em 3 passos
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center font-heading text-2xl font-bold mx-auto mb-4">
                {step.number}
              </div>
              <h3 className="font-heading font-semibold text-xl mb-2">
                {step.title}
              </h3>
              <p className="text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
