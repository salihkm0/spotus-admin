import { format, formatDistanceToNow, isAfter } from 'date-fns'

export const formatDate = (date) => {
  return format(new Date(date), 'PPpp')
}

export const formatRelativeTime = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export const isExpired = (date) => {
  return isAfter(new Date(), new Date(date))
}