import { pso, coordenadas_clientes } from "../models/pso.js";
import { io } from '../bin/www.js';


const getPsoResult = (req, res) => {
  console.log("coordenadas: ", coordenadas_clientes);

  const { mejor_global, mejor_costo_global } = pso(30, 1);

  res.render('pages/pso', {
    mejor_ruta: JSON.stringify(mejor_global),
    mejor_costo: mejor_costo_global,
    coordenadas_clientes: JSON.stringify(coordenadas_clientes),
    title: 'PSO Algoritmo'
  });

  pso(30, 500, (iteracion, mejor_ruta, mejor_costo) => {
    io.emit('update', {
      iteracion,
      mejor_ruta,
      mejor_costo
    });
  });

};

export { getPsoResult };