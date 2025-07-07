import "./App.css";
import Form from "./pages/Form";
import Gallery from "./pages/Gallery";
import Home from "./components/Home";
import {  Routes, Route } from 'react-router-dom'; 
import EditForm from "./pages/Edit";
function App() {
 
  return (
  <div>
     
     <Routes>
       <Route path="/" element={<Home />} />
       <Route path="/Gallery" element={<Gallery />} />
       <Route path="/Form" element={<Form />} />
       <Route path="/edit/:id" element={<EditForm />} />
     </Routes>
    
  </div>
  );
}

export default App;
