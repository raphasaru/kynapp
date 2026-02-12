import { ProfileForm } from '@/components/profile/profile-form'
import { LogoutButton } from '@/components/profile/logout-button'
import { SettingsSection } from '@/components/profile/settings-section'
import { Separator } from '@/components/ui/separator'

export default function ProfilePage() {
  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Perfil</h1>

      <ProfileForm />

      <Separator />

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Configurações</h2>
        <SettingsSection />
      </div>

      <Separator />

      <LogoutButton />
    </div>
  )
}
