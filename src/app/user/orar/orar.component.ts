import { Component, OnInit } from '@angular/core';
import { OrarEntry } from 'src/app/models/orar-entry';
import { OrarService } from 'src/app/services/orar.service';

@Component({
  selector: 'app-orar',
  templateUrl: './orar.component.html',
  styleUrls: ['./orar.component.scss']
})
export class OrarComponent implements OnInit {

  orarEntries: OrarEntry[] = [];
  days = ['Duminica', 'Luni', 'Marti', 'Miercuri', 'Joi', 'Vineri', 'Sambata'];
  dayIndex: number;
  types = ['Toate', 'Curs', 'Laborator', 'Seminar'];
  typeIndex = 0;

  constructor(private orarService: OrarService) { }

  ngOnInit() {
    this.dayIndex = new Date().getDay();

    // TODO ia grupa din userul logat
    this.orarService.getOrarEntries('313CC', null).subscribe(
      orarEntries => {
        orarEntries.forEach(element => {
          element.hour -= 0;
          element.duration -= 0;
        });
        this.orarEntries = orarEntries;
        console.log(orarEntries);
      }
    );
  }

  getColor(type) {
    if (type === 'Toate') return '#00E0FF';
    if (type === 'Curs') return '#FFC975';
    if (type === 'Laborator') return '#9CFF75';
    if (type === 'Seminar') return '#FF9F65';
    return '#00E0FF';
  }

  filterEntries(): OrarEntry[] {
    if (this.dayIndex == null) return null;
    let filtered = this.orarEntries.filter(e => e.day === this.days[this.dayIndex]);
    if (this.typeIndex !== 0) {
      return filtered.filter(e => e.type === this.types[this.typeIndex]);
    }
    return filtered;
  }

  incrementDayIndex() {
    this.dayIndex = this.dayIndex + 1;
    if (this.dayIndex === 7) this.dayIndex = 0;
  }

  decrementDayIndex() {
    this.dayIndex = this.dayIndex - 1;
    if (this.dayIndex === -1) this.dayIndex = 6;
  }

  navigate() {
    const url = 'https://www.google.com/maps/dir/44.4411135,26.0516816/Facultatea+de+Automatic%C4%83+%C8%99i+Calculatoare,+Splaiul+Independen%C8%9Bei+313,+Bucure%C8%99ti/@44.4386122,26.0479359,17z/data=!3m1!4b1!4m9!4m8!1m1!4e1!1m5!1m1!1s0x40b201ebafcdf7a3:0xeafb513bd76c5277!2m2!1d26.0477521!2d44.4357327';
    window.open(url, '_blank');
  }

}
