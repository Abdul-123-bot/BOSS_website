import logo from './logo.svg';
import './App.css';
import Nav from './components/Nav'
import { BrowserRouter , Route , Routes} from 'react-router-dom';
import Footer from './components/Footer';
import SignUp from './components/SignUp';
import PrivateComponent from './components/PrivateComponent';
import Login from './components/Login';
import AddProd from './components/AddProd';
import ListProd from './components/ProductList';
import UpdateProd from './components/UpdateProduct';
import BuyProd from './components/Buy';
import CheckOut from './components/Checkout';
import AddAddress from './components/AddAddress';
import Shipping from './components/Shipping';
import Analysis from './components/Analysis'
function App() {
  return (
    <div className="App">
      <BrowserRouter>
      <Nav />
      <Routes>
      <Route element = {<PrivateComponent/>}>
      <Route path = "/" element={<div className="ProductBody"><ListProd/></div>} />
      <Route path = "/add" element={<div className="ProductBody"><AddProd/></div>} />
      <Route path = "/update/:id" element={<div className="ProductBody"><UpdateProd/></div>} />
      <Route path = "/logout" element={<div className="ProductBody"><h1>Logout</h1></div>} />
      <Route path = "/profile" element={<div className="ProductBody"><h1>Profile</h1></div>} />
      <Route path = "/buy" element={<div className="ProductBody"><BuyProd/></div>}/>
      <Route path = "/checkout" element={<div className="ProductBody"><CheckOut/></div>}/>
      <Route path = "/addaddress" element={<div className="ProductBody"><AddAddress/></div>}/>
      <Route path = "/ship" element={<div className="ProductBody"><Shipping/></div>}/>
      <Route path = "/analysis" element={<div className="ProductBody"><Analysis/></div>}/>
      </Route>
      <Route path = "/signup" element={<div className="ProductBody"><SignUp /></div>} />
      <Route path = "/login" element={<div className="ProductBody"><Login /></div>} />
      </Routes>
      <Footer/>
      </BrowserRouter>

    </div>
  );
}

export default App;
