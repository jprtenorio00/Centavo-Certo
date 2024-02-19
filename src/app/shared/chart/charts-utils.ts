import { CompositeGraphicObject } from "./composite-graphic-object";
import { SimpleGraphicObject } from "./simple-graphic-object";


export class ChartsUtil {

  static getSimpleGraphicObject(
    data: Array<any>,
    nameField: string,
    valueField: string,
    extraField?: string
  ): Array<SimpleGraphicObject> {
    const result: Array<SimpleGraphicObject> = [];

    if (data) {
      data.forEach(d => {
        if (d[nameField] && d[valueField]) {
          const foundItem = result.find(x => x.name === d[nameField].toString());
          if (foundItem) {
            foundItem.value += d[valueField];
          } else {
            if (extraField) {
              result.push(new SimpleGraphicObject(d[nameField].toString(), d[valueField], { data: d[extraField] }));
            } else {
              result.push(new SimpleGraphicObject(d[nameField].toString(), d[valueField], null));
            }
          }
        }
      });
    }

    return result;
  }

  static getCompositeGraphicObject(
        data: Array<any>, 
        serieNameField: string, 
        nameField: string, 
        valueField: string, 
        extraField?: string
    ): Array<CompositeGraphicObject> {
        const result = new Array<CompositeGraphicObject>();

        // PREENCHE ARRAY COM NOMES DAS SÉRIES
        data.forEach(d => {
        if (!result.some(f => f.name === d[serieNameField].toString())) {
            result.push(new CompositeGraphicObject(d[serieNameField].toString(), new Array<SimpleGraphicObject>()));
        }
        });

        // PREENCHE AS SÉRIES
        data.forEach(r => {
        const foundComposite = result.find(x => x.name === r[serieNameField].toString());
        if (foundComposite) {
            const foundSimple = foundComposite.series.find(y => y.name === r[nameField]);
            if (foundSimple) {
            foundSimple.value += r[valueField];
            } else {
            if(extraField) {
                foundComposite.series.push(new SimpleGraphicObject(r[nameField], r[valueField], r[extraField]));
            } else {
                foundComposite.series.push(new SimpleGraphicObject(r[nameField], r[valueField], null));
            }
            }
        }
        });

        return result;
    }

}