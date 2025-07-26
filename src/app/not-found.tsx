import MenuBar from "@/components/menuBar/MenuBar";
import Footer from "@/components/Footer/Footer";
const NotFound = () => {
    return (
      <div className="page-container">
        <div className="content-wrap">
          <MenuBar showMenu={false} showArrow={true}/>
          <h1 style={{textAlign: "center"}}>Página no encontrada :(</h1>
        </div>
        <Footer />
      </div>
    )
}

export default NotFound;