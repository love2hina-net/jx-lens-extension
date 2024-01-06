import moment from 'moment';

export function createdTime(timestamp: string | undefined): moment.Moment | null {
  return timestamp ? moment(timestamp) : null;
}

export function dateFromNow(timestamp: string | undefined): string {
  return timestamp ? moment(timestamp).fromNow(false) : '';
}
