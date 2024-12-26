// ta fram polygonens geometriska centrum
export default function calculateCentroid(area: [number, number][]): [number, number] {
    let x = 0;
    let y = 0;
    let n = area.length;
  
    for (let i = 0; i < n; i++) {
      x += area[i][0];
      y += area[i][1];
    }
  
    return [x / n, y / n];
};