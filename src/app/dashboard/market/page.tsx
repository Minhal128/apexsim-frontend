import DashboardFooter from "@/components/dashboard/DashboardFooter"
import MarketComponent from "@/components/markets/MarketCrypto"
function page() {
  return (
    <div >
      <MarketComponent/>
      <DashboardFooter/>
    </div>
  )
}

export default page