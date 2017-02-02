import isArray from 'lodash/isArray'
import isDate from 'lodash/isDate'
import isEqual from 'lodash/isEqual'
import isObject from 'lodash/isObject'
import isUndefined from 'lodash/isUndefined'

const MagnusUtil = {
  changeset (o1, o2) {
    if (isEqual(o1, o2)) {
      return
    } else {
      if (isDate(o1) || isDate(o2)) {
        if (isDate(o1) && isDate(o2) && isEqual(+o1, +o2)) {
          return
        } else {
          return o2
        }
      } else if (isObject(o1) && isObject(o2) && !isArray(o1) && !isArray(o2)) {
        const obj = {}
        let key, val
        for (key in o1) {
          if (isUndefined(o2[key])) {
            obj[key] = null
          } else {
            val = this.changeset(o1[key], o2[key])
            if (!isUndefined(val)) {
              obj[key] = val
            }
          }
        }
        for (key in o2) {
          val = this.changeset(o1[key], o2[key])
          if (!isUndefined(val)) {
            obj[key] = val
          }
        }
        return obj
      } else {
        return o2
      }
    }
  }
}

export default MagnusUtil
