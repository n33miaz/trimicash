import { Pipe, PipeTransform } from '@angular/core';
import { formatBRL } from '@core/utils/money.util';

/**
 * BrlCurrencyPipe — TrimiCash
 * Formata valores monetários como BRL na camada de template.
 *
 * Uso: {{ valor | brlCurrency }}
 * Ex: {{ 1234.5 | brlCurrency }} → "R$ 1.234,50"
 */
@Pipe({
  name: 'brlCurrency',
  standalone: true,
  pure: true,
})
export class BrlCurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null) return 'R$ —';
    return formatBRL(value);
  }
}
