import { Component, OnInit } from '@angular/core';
import * as json from '../../../data/pacientes.json';
import { ngxCsv } from 'ngx-csv/ngx-csv';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';



@Component({
  selector: 'app-listado-pacientes',
  templateUrl: './listado-pacientes.component.html',
  styleUrls: ['./listado-pacientes.component.scss']
})
export class ListadoPacientesComponent implements OnInit {

  numsMaxilar = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28]
  numsMaxilar2 = [38,37,36,35,34,33,32,31,41,42,43,44,45,46,47,48];
  itemsPerPage: number = 5;
  p: number = 1;
  pacientes: any = json['default'];
  pacientesCopia: any = json['default'];
  pacienteBusqueda: string = '';
  listMode: boolean = true;
  nuevoPacienteModal: boolean = false;
  fichaModal: boolean = false;
  fichaActual: any = null;

  constructor() {
  
   }

  ngOnInit(): void {
  }

  /* 
   Función encargada de filtrar los resultados que contengan el termino introducido en el 'input search'.
  */

  buscarPaciente = (): void => {
    this.pacientes = [...this.pacientesCopia.filter( (p: any) => { 
      return p.datos_paciente.nombre.toLowerCase().includes(this.pacienteBusqueda.toLowerCase()) || p.datos_paciente.apellidos.toString().includes(this.pacienteBusqueda.toString())  ? true : false
     } )];
  }

  /*
   Función encargada de recoger los datos de la lista y descargarlos en formato CSV.
   */

  descargarCsv = (): void => {
    var options = { 
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true, 
      showTitle: true,
      title: 'pacientes-lista',
      useBom: true,
      noDownload: false,
      headers: ["nombre", "apellidos", "fecha_nacimiento", "clinica", "objetivo_tratamiento", "estado"]
    };

    let listaPacientesCsv = [...this.pacientesCopia.map((p: any) => {
      return {
        nombre: p.datos_paciente.nombre,
        apellidos: p.datos_paciente.apellidos,
        fecha_nacimiento: p.datos_paciente.fecha_nacimiento,
        clinica: p.ficha_dental.clinica,
        objetivo_tratamiento: p.ficha_dental.objetivo_tratamiento,
        estado: p.ficha_dental.estado
      }
    })]

    new ngxCsv(listaPacientesCsv, 'lista-pacientes', options);
  }

  // Función encargada de convertir el modal de la ficha del paciente a fotmato PDF para descargarlo

  descargarPdf = () => {
    let data: any = document.querySelector('.modalFichaPaciente .content');

    html2canvas(data).then(canvas => {
      let imgWidth = 208;
      let pageHeight = 295;
      let imgHeight = (canvas.height * imgWidth / canvas.width);
      let heightLeft = imgHeight;

      const contentDataURL = canvas.toDataURL('image/png')
            let pdf = new jspdf.jsPDF('p', 'mm', 'a4'); // A4 size page of PDF
            var position = 60;
            pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight)
            pdf.save('ficha-paciente.pdf'); // Generated PDF
    })
    
  }

  /* 
  Función encargada de retornar un color en forma de string dependiendo del estado que reciba;
  @estado: parámetro que indica el estado recogido en los datos de los pacientes
  */

  estiloEstado = (estado: string): string => {
    switch (estado) {
      case 'planificando':
        return '#1CCFFF'
      case 'facturado':
        return 'green'
      case 'enviado':
        return 'green'
      case 'aceptado':
        return 'green'
      case 'fabricando':
        return '#1CCFFF'
      case 'solicitado':
        return '#C4DA24'
      default:
        return ''
        break;
    }   
  }

  // Función encargada de limpiar el formulario

  resetForm = (e: any): void => {
    e.preventDefault()
    const form: any = document.querySelector('.nuevoPacienteForm');
    form?.reset();
  }

  /*
  Función encargada de cambiar el valor de la fichaActual y abrir un modal con esos datos.
  @e: Propiedad con la información del evento para que no se abra el modal dependiendo de donde se haga click
  @p: Propiedad con la información del paciente para cambiar la fichaActual
  */

  openFichaModal = (e: any, p: any): Boolean | void => {    
    if('select' == e.target.className) return false;
    this.fichaActual = p;
    this.fichaModal = true;
  }

  /* 
  Función encargada de calcular la posición de los diferentes divs que contienen los números que rodean a la imágen del maxilar
  @n: Parámetro con el número que contiene el div
  @i: Parámetro con el número de la posición del array que se está recorriendo
  return: Retorna en forma de string la propiedad de css que rota un elemento
  */

  calcPositionNum = (n:number, i: number ) => {
    return `transform: rotate(${ (i + 1) * 12 }deg); color: ${this.fichaActual.ficha_dental.dientes_no_mover.includes(n) ? 'red' : 'black'} `
  }
}
