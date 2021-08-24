

/**
 * Please use appLogger for logging in this file try to abstain from console
 * levels of logging:
 * - TRACE - ‘blue’
 * - DEBUG - ‘cyan’
 * - INFO - ‘green’
 * - WARN - ‘yellow’
 * - ERROR - ‘red’
 * - FATAL - ‘magenta’
 */

import FabricManager from '../../lib/fabricManager';

/**
 * 
 * @param {Object} payload 
 * @param {String} payload.message 
 * @param {Function} callback 
 */
const demoFunction = async (payload, callback) => {
  const result = await FabricManager.getClientId();
  const certs = await FabricManager.getAllCerts();
  appLogger.info({result});
  appLogger.info({certs});
  return callback(null, payload);
};

export default {
  demoFunction: demoFunction,
};
