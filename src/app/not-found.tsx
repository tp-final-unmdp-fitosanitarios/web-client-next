import MenuBar from "@/components/menuBar/MenuBar";

const NotFound = () => {
    return (
      <div>
        <MenuBar showMenu={true}/>
        <h1 style={{textAlign: "center"}}>Página no encontrada :(</h1>
      </div>
    )
}

export default NotFound;