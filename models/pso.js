import { sqrt, random, zeros } from "mathjs";

const NUM_CLIENTES = 15;
const NUM_VEHICULOS = 3;
const CAPACIDAD_VEHICULO = 1000;
const ALMACEN = [50, 50];

const coordenadas_clientes = Array.from({ length: NUM_CLIENTES }, () => [
  random(0, 100),
  random(0, 100),
]);

const demandas_clientes = Array.from({ length: NUM_CLIENTES }, () =>
  Math.floor(random() * 250 + 50)
);

function calcular_distancia(p1, p2) {
  return sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2);
}

function calcular_costo_ruta(rutas, demandas) {
  let costo_total = 0;
  for (const vehiculo_ruta of rutas) {
    let distancia_total = 0;
    let capacidad_utilizada = 0;
    let punto_actual = ALMACEN;
    for (const cliente of vehiculo_ruta) {
      distancia_total += calcular_distancia(
        punto_actual,
        coordenadas_clientes[cliente]
      );
      capacidad_utilizada += demandas[cliente];
      if (capacidad_utilizada > CAPACIDAD_VEHICULO) {
        const penalizacion = 1000 * (capacidad_utilizada - CAPACIDAD_VEHICULO);
        return distancia_total + penalizacion;
      }
      punto_actual = coordenadas_clientes[cliente];
    }
    distancia_total += calcular_distancia(punto_actual, ALMACEN);
    costo_total += distancia_total;
  }
  return costo_total;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

class Particula {
  constructor() {
    this.posicion = Array.from({ length: NUM_VEHICULOS }, () =>
      shuffle(Array.from({ length: NUM_CLIENTES }, (_, i) => i))
    );
    this.velocidad = Array.from(
      { length: NUM_VEHICULOS },
      () => zeros(NUM_CLIENTES)._data
    );
    this.mejor_posicion = this.posicion.map((r) => [...r]);
    this.mejor_costo = calcular_costo_ruta(this.posicion, demandas_clientes);
    this.costo_actual = this.mejor_costo;
  }

  actualizar_velocidad(mejor_global) {
    const w = 0.7;
    const c1 = 1.5;
    const c2 = 1.5;
    const r1 = random();
    const r2 = random();
    for (let i = 0; i < NUM_VEHICULOS; i++) {
      this.velocidad[i] = this.velocidad[i].map(
        (v, j) =>
          w * v +
          c1 * r1 * (this.mejor_posicion[i][j] - this.posicion[i][j]) +
          c2 * r2 * (mejor_global[i][j] - this.posicion[i][j])
      );
    }
  }

  actualizar_posicion() {
    for (let i = 0; i < NUM_VEHICULOS; i++) {
      for (let j = 0; j < this.posicion[i].length; j++) {
        if (random() < Math.abs(this.velocidad[i][j])) {
          const swap_idx = Math.floor(random() * this.posicion[i].length);
          [this.posicion[i][j], this.posicion[i][swap_idx]] = [
            this.posicion[i][swap_idx],
            this.posicion[i][j],
          ];
        }
      }
    }
    this.costo_actual = calcular_costo_ruta(this.posicion, demandas_clientes);
    if (this.costo_actual < this.mejor_costo) {
      this.mejor_posicion = this.posicion.map((r) => [...r]);
      this.mejor_costo = this.costo_actual;
    }
  }
}

function pso(num_particulas = 50, num_iteraciones = 100, callback) {
  const particulas = Array.from(
    { length: num_particulas },
    () => new Particula()
  );
  let mejor_global = particulas.reduce(
    (best, p) => (p.mejor_costo < best.mejor_costo ? p : best),
    particulas[0]
  ).mejor_posicion;
  let mejor_costo_global = particulas.reduce(
    (best, p) => (p.mejor_costo < best.mejor_costo ? p : best),
    particulas[0]
  ).mejor_costo;

  for (let iteracion = 0; iteracion < num_iteraciones; iteracion++) {
    for (const particula of particulas) {
      particula.actualizar_velocidad(mejor_global);
      particula.actualizar_posicion();
    }

    const mejor_particula = particulas.reduce(
      (best, p) => (p.costo_actual < best.costo_actual ? p : best),
      particulas[0]
    );
    if (mejor_particula.costo_actual < mejor_costo_global) {
      mejor_global = mejor_particula.posicion.map((r) => [...r]);
      mejor_costo_global = mejor_particula.costo_actual;
    }

    if (callback) {
      callback(iteracion, mejor_global, mejor_costo_global);
    }
  }
  return { mejor_global, mejor_costo_global };
}

export { pso, coordenadas_clientes };