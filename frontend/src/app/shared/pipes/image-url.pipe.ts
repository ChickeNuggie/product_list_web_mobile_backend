import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment';

@Pipe({
  name: 'imageUrl',
  pure: true
})
export class ImageUrlPipe implements PipeTransform {

  transform(image_url: string | null | undefined): string {
    if (!image_url) {
      console.log('No image URL provided');
      return '';
    }

    const fullUrl = `${environment.uploadsUrl}${image_url}`;
    console.log('Constructed image URL:', fullUrl);
    return fullUrl;
  }

}
