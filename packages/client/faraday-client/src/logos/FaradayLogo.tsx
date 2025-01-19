
export const faradayLogo = 'https://images.squarespace-cdn.com/content/v1/5e944efc25a0ae61d8406414/1586777919218-AQWMGF2VNVFEKKX5NQBO/banderola+copia.jpg?format=200w'

export function FaradayLogo({ className }: { className?: string }) {
  return (
    <img src={faradayLogo} className={className} alt="Faraday logo: image of Michael Faraday" />
  )
}