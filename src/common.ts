import { Common } from '@k8slens/extensions';
import moment from 'moment';

export function createdTime(timestamp: string | undefined): string {
  return timestamp ? moment(timestamp).format() : '';
}

export function dateFromNow(timestamp: string | undefined): string {
  return timestamp ? moment(timestamp).fromNow(false) : '';
}

/**
 * openExternalLink opens the external browser link
 * @param link
 */
export function openExternalLink(link: string) {
  window.setTimeout(() => {
    Common.Util.openExternal(link);
    console.log('opened link', link);
  }, 1);
}
