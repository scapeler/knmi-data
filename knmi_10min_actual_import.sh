SYSTEMCODE="SCAPE604"
SYSTEMPATH="/opt"

LOGFILE=$SYSTEMPATH/$SYSTEMCODE/log/knmi_10min_actual_import.log
echo "Start procedure on: " `date` >>$LOGFILE

cd $SYSTEMPATH/$SYSTEMCODE/knmi-data

node index knmi_10min_actual_import.js >>$LOGFILE

Rscript knmi_10min_actual_import.R >>$LOGFILE

echo "End   procedure on: " `date` >>$LOGFILE
exit 0
